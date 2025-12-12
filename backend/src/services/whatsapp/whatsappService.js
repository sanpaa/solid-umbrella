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
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // Start with 5 seconds
    this.maxReconnectDelay = 160000; // Maximum 160 seconds
    this.isReconnecting = false;
    this.currentQR = null; // Store current QR code
    this.qrListeners = []; // Listeners for QR updates
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
          
          // Store QR code for frontend access
          this.currentQR = qr;
          this.notifyQRListeners(qr);
        }

        if (connection === 'close') {
          const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

          logger.warn('❌ Conexão fechada. Reconectando:', shouldReconnect);

          if (shouldReconnect && !this.isReconnecting) {
            this.isReconnecting = true;
            
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              // Exponential backoff with maximum cap: 5s, 10s, 20s, 40s, 80s (capped at 160s)
              const delay = Math.min(
                this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
                this.maxReconnectDelay
              );
              
              logger.info(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay/1000}s...`);
              
              setTimeout(async () => {
                try {
                  this.isReconnecting = false;
                  await this.initialize();
                } catch (error) {
                  logger.error('❌ Erro na reconexão:', error.message);
                  this.isReconnecting = false;
                }
              }, delay);
            } else {
              logger.error('❌ Máximo de tentativas de reconexão atingido. WhatsApp Service desabilitado.');
              logger.warn('⚠️  Reinicie o servidor para tentar novamente.');
              this.isConnected = false;
              this.isReconnecting = false;
            }
          } else if (!shouldReconnect) {
            this.isConnected = false;
            this.reconnectAttempts = 0;
            this.isReconnecting = false;
            logger.warn('⚠️  Você foi desconectado. Escaneie o QR Code novamente.');
          }
        }

        if (connection === 'open') {
          this.isConnected = true;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          this.isReconnecting = false;
          this.phoneNumber = this.sock.user.id.split(':')[0];
          this.currentQR = null; // Clear QR code when connected
          this.notifyQRListeners(null);
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
      qrCode: this.currentQR,
      isReconnecting: this.isReconnecting,
    };
  }

  /**
   * Adicionar listener para atualizações de QR
   */
  addQRListener(callback) {
    this.qrListeners.push(callback);
  }

  /**
   * Remover listener de QR
   */
  removeQRListener(callback) {
    this.qrListeners = this.qrListeners.filter(l => l !== callback);
  }

  /**
   * Notificar listeners sobre novo QR
   */
  notifyQRListeners(qr) {
    this.qrListeners.forEach(listener => {
      try {
        listener(qr);
      } catch (error) {
        logger.error('Error notifying QR listener:', error);
      }
    });
  }

  /**
   * Obter QR code atual
   */
  getCurrentQR() {
    return this.currentQR;
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
