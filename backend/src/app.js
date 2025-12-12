const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const orderRoutes = require('./routes/order.routes');
const quoteRoutes = require('./routes/quote.routes');
const financialRoutes = require('./routes/financial.routes');
const technicianRoutes = require('./routes/technician.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();

// ============================================================================
// MIDDLEWARES GERAIS
// ============================================================================

// Security headers
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging HTTP requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Tente novamente mais tarde.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API de Gestão de Serviços',
    version: '1.0.0',
    documentation: '/api/v1',
  });
});

// ============================================================================
// ROTAS DA API
// ============================================================================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/clients`, clientRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/quotes`, quoteRoutes);
app.use(`${API_PREFIX}/financial`, financialRoutes);
app.use(`${API_PREFIX}/technicians`, technicianRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/whatsapp`, whatsappRoutes);

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
      path: req.path,
    },
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use(errorHandler);

module.exports = app;
