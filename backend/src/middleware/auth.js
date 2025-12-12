const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware para verificar autenticação JWT
 */
async function authenticate(req, res, next) {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token de autenticação não fornecido',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Formato de token inválido',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const token = parts[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado',
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Usuário inativo',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para verificar role do usuário
 * @param {...string} allowedRoles - Roles permitidas
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Não autenticado',
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Sem permissão para acessar este recurso',
        },
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
