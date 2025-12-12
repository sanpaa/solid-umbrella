const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/v1/auth/register
 * Registrar novo usuário
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Validar dados
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, senha e nome são obrigatórios',
        },
      });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'Email já cadastrado',
        },
      });
    }

    // Criar usuário
    const user = await User.create({
      email,
      password_hash: password,
      name,
      role: role || 'client',
    });

    // Gerar tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
      message: 'Usuário registrado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/login
 * Fazer login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email e senha são obrigatórios',
        },
      });
    }

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos',
        },
      });
    }

    // Verificar senha
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos',
        },
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Usuário inativo',
        },
      });
    }

    // Atualizar last_login
    user.last_login = new Date();
    await user.save();

    // Gerar tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
      message: 'Login realizado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/refresh
 * Renovar token de acesso
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token não fornecido',
        },
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Buscar usuário
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token inválido',
        },
      });
    }

    // Gerar novos tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 * Fazer logout
 */
router.post('/logout', authenticate, async (req, res) => {
  // Em uma implementação real, você invalidaria o token aqui
  // Por exemplo, adicionando-o a uma blacklist no Redis
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
});

/**
 * GET /api/v1/auth/me
 * Obter dados do usuário logado
 */
router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: req.user.toJSON(),
  });
});

module.exports = router;
