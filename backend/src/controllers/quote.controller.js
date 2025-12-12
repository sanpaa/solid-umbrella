const { Quote, Client, ServiceOrder, User } = require('../models');
const { Op } = require('sequelize');

exports.listQuotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, client_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (client_id) {
      where.client_id = client_id;
    }

    const { count, rows: quotes } = await Quote.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'phone', 'whatsapp'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
        {
          model: ServiceOrder,
          as: 'order',
          attributes: ['id', 'order_number', 'status'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        quotes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error listing quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar orçamentos',
      error: error.message,
    });
  }
};

exports.getQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
        {
          model: ServiceOrder,
          as: 'order',
        },
      ],
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado',
      });
    }

    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Error getting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar orçamento',
      error: error.message,
    });
  }
};

exports.createQuote = async (req, res) => {
  try {
    const {
      client_id,
      description,
      items,
      subtotal,
      discount,
      total,
      valid_until,
      notes,
    } = req.body;

    if (!client_id || !items || !subtotal || !total) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, itens, subtotal e total são obrigatórios',
      });
    }

    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
      });
    }

    const quote = await Quote.create({
      client_id,
      description,
      items,
      subtotal,
      discount: discount || 0,
      total,
      valid_until: valid_until || null,
      notes,
      created_by: req.user.id,
      status: 'pending',
    });

    const quoteWithRelations = await Quote.findByPk(quote.id, {
      include: [
        {
          model: Client,
          as: 'client',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: quoteWithRelations,
      message: 'Orçamento criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar orçamento',
      error: error.message,
    });
  }
};

exports.approveQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
        },
      ],
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado',
      });
    }

    if (quote.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Orçamento já aprovado',
      });
    }

    // Update quote status
    await quote.update({
      status: 'approved',
      approved_at: new Date(),
    });

    // Create Service Order if not exists
    if (!quote.order_id) {
      const order = await ServiceOrder.create({
        client_id: quote.client_id,
        created_by: quote.created_by,
        service_type: 'refrigeration', // Default, can be changed
        problem: quote.description || 'Serviço aprovado via orçamento',
        estimated_cost: quote.total,
        status: 'open',
        notes: `Criado a partir do orçamento ${quote.quote_number}`,
      });

      await quote.update({ order_id: order.id });

      const updatedQuote = await Quote.findByPk(id, {
        include: [
          {
            model: Client,
            as: 'client',
          },
          {
            model: ServiceOrder,
            as: 'order',
          },
        ],
      });

      return res.json({
        success: true,
        data: updatedQuote,
        message: 'Orçamento aprovado e OS criada com sucesso',
      });
    }

    res.json({
      success: true,
      data: quote,
      message: 'Orçamento aprovado com sucesso',
    });
  } catch (error) {
    console.error('Error approving quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar orçamento',
      error: error.message,
    });
  }
};

exports.rejectQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const quote = await Quote.findByPk(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado',
      });
    }

    await quote.update({
      status: 'rejected',
      rejected_at: new Date(),
      rejection_reason,
    });

    res.json({
      success: true,
      data: quote,
      message: 'Orçamento rejeitado',
    });
  } catch (error) {
    console.error('Error rejecting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao rejeitar orçamento',
      error: error.message,
    });
  }
};

exports.sendQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
        },
      ],
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado',
      });
    }

    if (!quote.client.whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não possui WhatsApp cadastrado',
      });
    }

    await quote.update({
      status: 'sent',
      sent_at: new Date(),
    });

    // Generate WhatsApp message with approval link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const approvalLink = `${frontendUrl}/public/quotes/${quote.id}`;
    
    const items = Array.isArray(quote.items) ? quote.items : [];
    const itemsList = items.map(item => 
      `• ${item.description} - Qtd: ${item.quantity} - R$ ${parseFloat(item.unit_price).toFixed(2)}`
    ).join('\n');

    const whatsappMessage = `
🔧 *Orçamento ${quote.quote_number}*

Olá ${quote.client.name}!

Segue o orçamento solicitado:

${quote.description ? quote.description + '\n\n' : ''}*Itens:*
${itemsList}

*Subtotal:* R$ ${parseFloat(quote.subtotal).toFixed(2)}
${quote.discount > 0 ? `*Desconto:* R$ ${parseFloat(quote.discount).toFixed(2)}\n` : ''}*Total:* R$ ${parseFloat(quote.total).toFixed(2)}

${quote.valid_until ? `Válido até: ${new Date(quote.valid_until).toLocaleDateString('pt-BR')}\n\n` : ''}Para aprovar este orçamento, clique no link abaixo:
${approvalLink}

Ou responda esta mensagem para qualquer dúvida!
    `.trim();

    // Here we would integrate with WhatsApp service to send the message
    // For now, return the message that would be sent
    res.json({
      success: true,
      data: {
        quote,
        whatsappMessage,
        approvalLink,
      },
      message: 'Orçamento preparado para envio via WhatsApp',
    });
  } catch (error) {
    console.error('Error sending quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar orçamento',
      error: error.message,
    });
  }
};
