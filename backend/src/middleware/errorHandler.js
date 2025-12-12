const logger = require('../utils/logger');

/**
 * Middleware de tratamento de erros global
 */
function errorHandler(err, req, res, next) {
  // Log do erro
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Erro de validação do Joi
  if (err.name === 'ValidationError' && err.isJoi) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: err.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Erro do Sequelize (banco de dados)
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação no banco de dados',
        details: err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Registro duplicado',
        details: err.errors.map((e) => ({
          field: e.path,
          message: `${e.path} já existe`,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Erro de autenticação JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'JSON inválido',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Erro customizado com statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        details: err.details || undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Erro genérico (500)
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
