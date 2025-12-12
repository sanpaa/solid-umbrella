const { Client } = require('../models');
const { Op } = require('sequelize');

exports.listClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { cpf_cnpj: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { whatsapp: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (active !== undefined) {
      where.is_active = active === 'true';
    }

    const { count, rows: clients } = await Client.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error listing clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar clientes',
      error: error.message,
    });
  }
};

exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente',
      error: error.message,
    });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, cpf_cnpj, phone, whatsapp, email, client_type, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório',
      });
    }

    const client = await Client.create({
      name,
      cpf_cnpj,
      phone,
      whatsapp,
      email,
      client_type,
      notes,
    });

    res.status(201).json({
      success: true,
      data: client,
      message: 'Cliente criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente',
      error: error.message,
    });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cpf_cnpj, phone, whatsapp, email, client_type, notes, is_active } = req.body;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
      });
    }

    await client.update({
      name: name !== undefined ? name : client.name,
      cpf_cnpj: cpf_cnpj !== undefined ? cpf_cnpj : client.cpf_cnpj,
      phone: phone !== undefined ? phone : client.phone,
      whatsapp: whatsapp !== undefined ? whatsapp : client.whatsapp,
      email: email !== undefined ? email : client.email,
      client_type: client_type !== undefined ? client_type : client.client_type,
      notes: notes !== undefined ? notes : client.notes,
      is_active: is_active !== undefined ? is_active : client.is_active,
    });

    res.json({
      success: true,
      data: client,
      message: 'Cliente atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente',
      error: error.message,
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
      });
    }

    await client.update({ is_active: false });

    res.json({
      success: true,
      message: 'Cliente desativado com sucesso',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar cliente',
      error: error.message,
    });
  }
};
