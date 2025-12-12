const { User, Technician } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (role) {
      where.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Technician,
          as: 'technician',
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Technician,
          as: 'technician',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, technician_info } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, senha, nome e role são obrigatórios',
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    const user = await User.create({
      email,
      password_hash: password,
      name,
      role,
    });

    // If role is technician, create technician record
    if (role === 'technician' && technician_info) {
      await Technician.create({
        user_id: user.id,
        specialty: technician_info.specialty || 'both',
        phone: technician_info.phone,
        vehicle_plate: technician_info.vehicle_plate,
      });
    }

    const userWithTechnician = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Technician,
          as: 'technician',
          required: false,
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: userWithTechnician,
      message: 'Usuário criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, name, role, is_active } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    const updates = {
      email: email !== undefined ? email : user.email,
      name: name !== undefined ? name : user.name,
      role: role !== undefined ? role : user.role,
      is_active: is_active !== undefined ? is_active : user.is_active,
    };

    if (password) {
      updates.password_hash = password;
    }

    await user.update(updates);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Technician,
          as: 'technician',
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message,
    });
  }
};

exports.listTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'is_active'],
          where: { is_active: true },
        },
      ],
    });

    res.json({
      success: true,
      data: technicians,
    });
  } catch (error) {
    console.error('Error listing technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar técnicos',
      error: error.message,
    });
  }
};
