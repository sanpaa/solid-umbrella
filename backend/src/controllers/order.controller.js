const { ServiceOrder, Client, Technician, User } = require('../models');
const { Op } = require('sequelize');

exports.listOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, client_id, technician_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (client_id) {
      where.client_id = client_id;
    }

    if (technician_id) {
      where.technician_id = technician_id;
    }

    const { count, rows: orders } = await ServiceOrder.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'phone', 'whatsapp'],
        },
        {
          model: Technician,
          as: 'technician',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          }],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar ordens de serviço',
      error: error.message,
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ServiceOrder.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
        },
        {
          model: Technician,
          as: 'technician',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          }],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ordem de serviço',
      error: error.message,
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      client_id,
      service_type,
      equipment,
      problem,
      priority,
      scheduled_date,
      estimated_cost,
      notes,
    } = req.body;

    if (!client_id || !service_type || !problem) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, tipo de serviço e problema são obrigatórios',
      });
    }

    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
      });
    }

    const order = await ServiceOrder.create({
      client_id,
      service_type,
      equipment,
      problem,
      priority: priority || 'normal',
      scheduled_date: scheduled_date === '' ? null : scheduled_date,
      estimated_cost: estimated_cost === '' ? null : estimated_cost,
      notes,
      created_by: req.user.id,
      status: 'open',
    });

    const orderWithRelations = await ServiceOrder.findByPk(order.id, {
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
      data: orderWithRelations,
      message: 'Ordem de serviço criada com sucesso',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar ordem de serviço',
      error: error.message,
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Sanitize date fields - convert empty strings to null
    if (updates.scheduled_date === '') {
      updates.scheduled_date = null;
    }
    if (updates.started_at === '') {
      updates.started_at = null;
    }
    if (updates.completed_at === '') {
      updates.completed_at = null;
    }

    const order = await ServiceOrder.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada',
      });
    }

    await order.update(updates);

    const updatedOrder = await ServiceOrder.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
        },
        {
          model: Technician,
          as: 'technician',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          }],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Ordem de serviço atualizada com sucesso',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar ordem de serviço',
      error: error.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status é obrigatório',
      });
    }

    const order = await ServiceOrder.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada',
      });
    }

    const updates = { status };

    if (status === 'in_progress' && !order.started_at) {
      updates.started_at = new Date();
    }

    if (status === 'completed' && !order.completed_at) {
      updates.completed_at = new Date();
    }

    await order.update(updates);

    res.json({
      success: true,
      data: order,
      message: 'Status atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status',
      error: error.message,
    });
  }
};

exports.assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({
        success: false,
        message: 'Técnico é obrigatório',
      });
    }

    const order = await ServiceOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada',
      });
    }

    const technician = await Technician.findByPk(technician_id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Técnico não encontrado',
      });
    }

    await order.update({
      technician_id,
      status: order.status === 'open' ? 'assigned' : order.status,
    });

    const updatedOrder = await ServiceOrder.findByPk(id, {
      include: [
        {
          model: Technician,
          as: 'technician',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          }],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Técnico atribuído com sucesso',
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atribuir técnico',
      error: error.message,
    });
  }
};
