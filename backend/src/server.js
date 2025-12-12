require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/database');
const { getWhatsAppService } = require('./services/whatsapp/whatsappService');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Função para iniciar o servidor
async function startServer() {
  try {
    // Testar conexão com o banco de dados
    await sequelize.authenticate();
    logger.info('✅ Conexão com banco de dados estabelecida com sucesso');

    // Sincronizar models (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: true });
      // logger.info('✅ Models sincronizados com o banco');
    }

    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📍 API disponível em: http://localhost:${PORT}/api/v1`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // Inicializar WhatsApp Service (se habilitado)
    if (process.env.WHATSAPP_ENABLED === 'true') {
      try {
        logger.info('📱 Inicializando WhatsApp Service...');
        const whatsapp = getWhatsAppService();
        await whatsapp.initialize();
        logger.info('✅ WhatsApp Service inicializado');
      } catch (error) {
        logger.error('❌ Erro ao inicializar WhatsApp:', error.message);
        logger.warn('⚠️  Continuando sem WhatsApp...');
      }
    }

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} recebido. Encerrando gracefully...`);

      // Fechar servidor HTTP
      server.close(async () => {
        logger.info('✅ Servidor HTTP fechado');

        try {
          // Fechar conexão com banco
          await sequelize.close();
          logger.info('✅ Conexão com banco fechada');

          // Desconectar WhatsApp
          if (process.env.WHATSAPP_ENABLED === 'true') {
            const whatsapp = getWhatsAppService();
            await whatsapp.disconnect();
            logger.info('✅ WhatsApp desconectado');
          }

          process.exit(0);
        } catch (error) {
          logger.error('❌ Erro ao fechar conexões:', error);
          process.exit(1);
        }
      });

      // Forçar encerramento após 10 segundos
      setTimeout(() => {
        logger.error('⚠️  Forçando encerramento...');
        process.exit(1);
      }, 10000);
    };

    // Listeners para sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Listener para erros não tratados
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection:', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    logger.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();
