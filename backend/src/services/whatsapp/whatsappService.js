const path = require('path');
const logger = require('../../utils/logger');

/**
 * WhatsApp Service usando Baileys
 * 
 * NOTA: Este é um serviço simplificado para demonstração.
 * Para implementação completa, veja docs/WHATSAPP_INTEGRATION.md
 * 
 * Para funcionar completamente, instale as dependências:
 * npm install @whiskeysockets/baileys qrcode-terminal pino
 */

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.authFolder = path.join(__dirname, '../../../auth_info');
    this.isConnected = false;
    this.phoneNumber = null;
  }

  async initialize() {
    try {
      logger.info('📱 WhatsApp Service inicializando...');
      
      // Verificar se Baileys está instalado
      try {
        require.resolve('@whiskeysockets/baileys');
      } catch (e) {
        logger.warn('⚠️  @whiskeysockets/baileys não está instalado');
        logger.warn('⚠️  Execute: npm install @whiskeysockets/baileys qrcode-terminal pino');
        logger.warn('⚠️  WhatsApp Service não estará disponível');
        return;
      }

      const makeWASocket = require('@whiskeysockets/baileys').default;
      const {
        useMultiFileAuthState,
        DisconnectReason,
        fetchLatestBaileysVersion,
      } = require('@whiskeysockets/baileys');
      const qrcode = require('qrcode-terminal');
      const pino = require('pino');
      const fs = require('fs');

      // Criar pasta de autenticação se não existir
      if (!fs.existsSync(this.authFolder)) {
        fs.mkdirSync(this.authFolder, { recursive: true });
      }

      // Carregar estado de autenticação
      const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);

      // Obter versão mais recente
      const { version } = await fetchLatestBaileysVersion();

      // Criar socket
      this.sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
      });

      // Event: Atualização de conexão
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          logger.info('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:\n');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

          logger.warn('❌ Conexão fechada. Reconectando:', shouldReconnect);

          if (shouldReconnect) {
            await this.initialize();
          } else {
            this.isConnected = false;
            logger.warn('⚠️  Você foi desconectado. Escaneie o QR Code novamente.');
          }
        }

        if (connection === 'open') {
          this.isConnected = true;
          this.phoneNumber = this.sock.user.id.split(':')[0];
          logger.info('✅ Conectado ao WhatsApp!');
          logger.info(`📞 Número: ${this.phoneNumber}`);
        }
      });

      // Event: Salvar credenciais
      this.sock.ev.on('creds.update', saveCreds);

      logger.info('🚀 WhatsApp Service inicializado');
    } catch (error) {
      logger.error('❌ Erro ao inicializar WhatsApp Service:', error.message);
      throw error;
    }
  }

  /**
   * Formatar número de telefone
   */
  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return `${cleaned}@s.whatsapp.net`;
  }

  /**
   * Enviar mensagem de texto
   */
  async sendTextMessage(phoneNumber, message) {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      const jid = this.formatPhoneNumber(phoneNumber);
      
      const result = await this.sock.sendMessage(jid, {
        text: message,
      });

      logger.info(`✅ Mensagem enviada para ${phoneNumber}`);
      return {
        success: true,
        messageId: result.key.id,
        timestamp: result.messageTimestamp,
      };
    } catch (error) {
      logger.error('❌ Erro ao enviar mensagem:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verificar se está conectado
   */
  isWhatsAppConnected() {
    return this.isConnected;
  }

  /**
   * Obter informações da conexão
   */
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      phoneNumber: this.phoneNumber,
    };
  }

  /**
   * Desconectar
   */
  async disconnect() {
    if (this.sock) {
      await this.sock.logout();
      this.isConnected = false;
      logger.info('🔌 WhatsApp desconectado');
    }
  }
}

// Singleton
let whatsappServiceInstance = null;

function getWhatsAppService() {
  if (!whatsappServiceInstance) {
    whatsappServiceInstance = new WhatsAppService();
  }
  return whatsappServiceInstance;
}

module.exports = { getWhatsAppService, WhatsAppService };
