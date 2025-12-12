# Integração WhatsApp - Guia Completo

## 🎯 Visão Geral

Este sistema usa **Baileys**, uma biblioteca Node.js 100% gratuita que conecta ao WhatsApp Web via WebSocket. Não requer API oficial paga do Meta.

### Vantagens do Baileys
✅ **Totalmente gratuito** - Sem custos mensais  
✅ **Fácil configuração** - QR Code simples  
✅ **Recursos completos** - Texto, imagens, documentos, botões  
✅ **Persistência** - Reconexão automática  
✅ **Status de entrega** - Enviado, entregue, lido  

### Limitações
⚠️ **Não-oficial** - Pode haver mudanças no protocolo do WhatsApp  
⚠️ **Limite de mensagens** - Evite enviar muitas mensagens muito rápido  
⚠️ **Requer dispositivo** - Precisa de um número de celular  
⚠️ **Multi-device** - Funciona com WhatsApp Multi-device  

## 📦 Instalação

### 1. Instalar Dependências

```bash
cd backend
npm install @whiskeysockets/baileys qrcode-terminal pino
```

### 2. Estrutura de Arquivos

```
backend/src/services/whatsapp/
├── whatsappService.js      # Serviço principal
├── messageTemplates.js     # Templates de mensagens
├── qrHandler.js            # Geração de QR Code
└── sessionManager.js       # Gerenciamento de sessão
```

## 🔧 Implementação

### whatsappService.js

```javascript
const makeWASocket = require('@whiskeysockets/baileys').default;
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.store = makeInMemoryStore({
      logger: pino().child({ level: 'silent', stream: 'store' }),
    });
    this.authFolder = path.join(__dirname, '../../auth_info');
    this.isConnected = false;
    this.phoneNumber = null;
  }

  async initialize() {
    try {
      // Criar pasta de autenticação se não existir
      if (!fs.existsSync(this.authFolder)) {
        fs.mkdirSync(this.authFolder, { recursive: true });
      }

      // Carregar estado de autenticação
      const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);

      // Obter versão mais recente do Baileys
      const { version } = await fetchLatestBaileysVersion();

      // Criar socket
      this.sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        getMessage: async (key) => {
          if (this.store) {
            const msg = await this.store.loadMessage(key.remoteJid, key.id);
            return msg?.message || undefined;
          }
          return undefined;
        },
      });

      // Bind store
      this.store.bind(this.sock.ev);

      // Event: Atualização de conexão
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:\n');
          qrcode.generate(qr, { small: true });
          console.log('\n');
        }

        if (connection === 'close') {
          const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

          console.log(
            '❌ Conexão fechada. Reconectando:',
            shouldReconnect
          );

          if (shouldReconnect) {
            await this.initialize();
          } else {
            this.isConnected = false;
            console.log('⚠️  Você foi desconectado. Escaneie o QR Code novamente.');
          }
        }

        if (connection === 'open') {
          this.isConnected = true;
          this.phoneNumber = this.sock.user.id.split(':')[0];
          console.log('✅ Conectado ao WhatsApp!');
          console.log('📞 Número:', this.phoneNumber);
        }
      });

      // Event: Salvar credenciais
      this.sock.ev.on('creds.update', saveCreds);

      // Event: Mensagens recebidas
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
          for (const msg of messages) {
            if (!msg.key.fromMe && msg.message) {
              await this.handleIncomingMessage(msg);
            }
          }
        }
      });

      // Event: Status de mensagem (entregue, lido)
      this.sock.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
          await this.handleMessageStatus(update);
        }
      });

      console.log('🚀 WhatsApp Service inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp Service:', error);
      throw error;
    }
  }

  /**
   * Formatar número de telefone para formato WhatsApp
   * @param {string} phoneNumber - Número com código do país (ex: 5511987654321)
   * @returns {string} - Número formatado (ex: 5511987654321@s.whatsapp.net)
   */
  formatPhoneNumber(phoneNumber) {
    // Remover caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Adicionar sufixo do WhatsApp
    return `${cleaned}@s.whatsapp.net`;
  }

  /**
   * Enviar mensagem de texto
   * @param {string} phoneNumber - Número do destinatário
   * @param {string} message - Texto da mensagem
   * @returns {Promise<object>} - Resultado do envio
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

      console.log(`✅ Mensagem enviada para ${phoneNumber}`);
      return {
        success: true,
        messageId: result.key.id,
        timestamp: result.messageTimestamp,
      };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enviar imagem com legenda
   * @param {string} phoneNumber - Número do destinatário
   * @param {string} imagePath - Caminho da imagem
   * @param {string} caption - Legenda opcional
   */
  async sendImage(phoneNumber, imagePath, caption = '') {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      const jid = this.formatPhoneNumber(phoneNumber);
      const imageBuffer = fs.readFileSync(imagePath);

      const result = await this.sock.sendMessage(jid, {
        image: imageBuffer,
        caption: caption,
      });

      console.log(`✅ Imagem enviada para ${phoneNumber}`);
      return {
        success: true,
        messageId: result.key.id,
      };
    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enviar documento PDF
   * @param {string} phoneNumber - Número do destinatário
   * @param {string} pdfPath - Caminho do PDF
   * @param {string} filename - Nome do arquivo
   */
  async sendDocument(phoneNumber, pdfPath, filename) {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      const jid = this.formatPhoneNumber(phoneNumber);
      const documentBuffer = fs.readFileSync(pdfPath);

      const result = await this.sock.sendMessage(jid, {
        document: documentBuffer,
        mimetype: 'application/pdf',
        fileName: filename,
      });

      console.log(`✅ Documento enviado para ${phoneNumber}`);
      return {
        success: true,
        messageId: result.key.id,
      };
    } catch (error) {
      console.error('❌ Erro ao enviar documento:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enviar mensagem com botões (interativa)
   * @param {string} phoneNumber - Número do destinatário
   * @param {string} text - Texto da mensagem
   * @param {array} buttons - Array de botões
   */
  async sendButtonMessage(phoneNumber, text, buttons) {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      const jid = this.formatPhoneNumber(phoneNumber);

      const buttonMessage = {
        text: text,
        footer: 'Sistema de Gestão de Serviços',
        buttons: buttons.map((btn, index) => ({
          buttonId: `btn_${index}`,
          buttonText: { displayText: btn },
          type: 1,
        })),
        headerType: 1,
      };

      const result = await this.sock.sendMessage(jid, buttonMessage);

      console.log(`✅ Mensagem com botões enviada para ${phoneNumber}`);
      return {
        success: true,
        messageId: result.key.id,
      };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem com botões:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Processar mensagens recebidas
   */
  async handleIncomingMessage(msg) {
    try {
      const from = msg.key.remoteJid;
      const phoneNumber = from.split('@')[0];
      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || '';

      console.log(`📨 Mensagem recebida de ${phoneNumber}: ${text}`);

      // Aqui você pode implementar lógica para processar respostas
      // Por exemplo, responder a comandos específicos
      
      // Salvar no banco de dados
      // await WhatsAppLog.create({ ... });

      // Processar comandos
      if (text.toLowerCase().includes('status')) {
        // Buscar OS do cliente e enviar status
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem recebida:', error);
    }
  }

  /**
   * Processar status de mensagem (entregue, lido)
   */
  async handleMessageStatus(update) {
    try {
      const messageId = update.key.id;
      const status = update.update;

      if (status.status === 2) {
        console.log(`✅ Mensagem ${messageId} entregue`);
        // Atualizar no banco: status = 'delivered'
      } else if (status.status === 3) {
        console.log(`👀 Mensagem ${messageId} lida`);
        // Atualizar no banco: status = 'read'
      }
    } catch (error) {
      console.error('❌ Erro ao processar status:', error);
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
      console.log('🔌 WhatsApp desconectado');
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
```

### messageTemplates.js

```javascript
/**
 * Templates de mensagens automáticas
 */

const messageTemplates = {
  /**
   * Confirmação de criação de OS
   */
  orderCreated: (data) => {
    const { orderNumber, clientName, serviceType, scheduledDate, equipment } = data;
    
    return `🔧 *Nova Ordem de Serviço*

Olá ${clientName}!

Sua ordem de serviço foi criada com sucesso:

📋 *Número:* ${orderNumber}
🛠️ *Tipo:* ${serviceType === 'refrigeration' ? 'Refrigeração' : 'Elétrica'}
📦 *Equipamento:* ${equipment}
📅 *Data agendada:* ${scheduledDate}

Em breve um técnico será designado para atender você.

Obrigado pela preferência! 😊`;
  },

  /**
   * OS atribuída a técnico
   */
  orderAssigned: (data) => {
    const { orderNumber, clientName, technicianName, technicianPhone, scheduledDate } = data;
    
    return `👨‍🔧 *Técnico Designado*

Olá ${clientName}!

Sua OS ${orderNumber} foi atribuída ao técnico:

👤 *Técnico:* ${technicianName}
📱 *Contato:* ${technicianPhone}
📅 *Data/Hora:* ${scheduledDate}

O técnico entrará em contato em breve para confirmar o horário.`;
  },

  /**
   * Lembrete de visita (1 dia antes)
   */
  visitReminder: (data) => {
    const { clientName, orderNumber, scheduledDate, technicianName, address } = data;
    
    return `⏰ *Lembrete de Visita*

Olá ${clientName}!

Lembramos que amanhã temos uma visita agendada:

📋 *OS:* ${orderNumber}
👨‍🔧 *Técnico:* ${technicianName}
📅 *Data/Hora:* ${scheduledDate}
📍 *Local:* ${address}

Se precisar reagendar, entre em contato conosco.

Até amanhã! 👋`;
  },

  /**
   * OS concluída
   */
  orderCompleted: (data) => {
    const { orderNumber, clientName, technicianName, finalCost, solution } = data;
    
    return `✅ *Serviço Concluído*

Olá ${clientName}!

Sua OS ${orderNumber} foi concluída com sucesso!

👨‍🔧 *Técnico:* ${technicianName}
🔧 *Solução:* ${solution}
💰 *Valor:* R$ ${finalCost.toFixed(2)}

Esperamos ter atendido suas expectativas!

Avalie nosso atendimento: [link]

Obrigado! 😊`;
  },

  /**
   * Orçamento enviado
   */
  quoteSent: (data) => {
    const { quoteNumber, clientName, total, validUntil, approvalLink } = data;
    
    return `💰 *Orçamento Pronto*

Olá ${clientName}!

Seu orçamento está pronto:

📋 *Número:* ${quoteNumber}
💵 *Valor total:* R$ ${total.toFixed(2)}
⏰ *Válido até:* ${validUntil}

Para ver os detalhes e aprovar, clique no link abaixo:
${approvalLink}

✅ Aprovar
❌ Recusar
💬 Negociar

Qualquer dúvida, estamos à disposição!`;
  },

  /**
   * Orçamento aprovado
   */
  quoteApproved: (data) => {
    const { quoteNumber, clientName, orderNumber } = data;
    
    return `✅ *Orçamento Aprovado*

Olá ${clientName}!

Obrigado por aprovar o orçamento ${quoteNumber}!

Uma nova OS foi criada automaticamente:
📋 *OS:* ${orderNumber}

Em breve agendaremos o serviço. Entraremos em contato!`;
  },

  /**
   * Lembrete de pagamento
   */
  paymentReminder: (data) => {
    const { clientName, orderNumber, amount, dueDate } = data;
    
    return `💰 *Lembrete de Pagamento*

Olá ${clientName}!

Lembramos que o pagamento da OS ${orderNumber} vence em breve:

💵 *Valor:* R$ ${amount.toFixed(2)}
📅 *Vencimento:* ${dueDate}

Formas de pagamento:
• PIX: [chave]
• Cartão
• Dinheiro

Após o pagamento, envie o comprovante.

Obrigado! 🙏`;
  },

  /**
   * Aguardando peça
   */
  waitingPart: (data) => {
    const { clientName, orderNumber, partName, estimatedDate } = data;
    
    return `⏳ *Aguardando Peça*

Olá ${clientName}!

Sua OS ${orderNumber} está aguardando a chegada de uma peça:

🔩 *Peça:* ${partName}
📅 *Previsão:* ${estimatedDate}

Assim que a peça chegar, agendaremos a continuação do serviço.

Pedimos desculpas pelo transtorno! 🙏`;
  },

  /**
   * OS cancelada
   */
  orderCancelled: (data) => {
    const { clientName, orderNumber, reason } = data;
    
    return `❌ *OS Cancelada*

Olá ${clientName}!

Sua OS ${orderNumber} foi cancelada:

📝 *Motivo:* ${reason}

Se precisar de algo, estamos à disposição!

Até breve! 👋`;
  },
};

module.exports = messageTemplates;
```

## 🎯 Casos de Uso

### 1. Enviar confirmação ao criar OS

```javascript
// Em orderController.js
const { getWhatsAppService } = require('../services/whatsapp/whatsappService');
const messageTemplates = require('../services/whatsapp/messageTemplates');

async function createOrder(req, res) {
  try {
    // ... criar OS no banco ...
    
    // Enviar WhatsApp
    const whatsapp = getWhatsAppService();
    const message = messageTemplates.orderCreated({
      orderNumber: order.order_number,
      clientName: client.name,
      serviceType: order.service_type,
      scheduledDate: formatDate(order.scheduled_date),
      equipment: order.equipment,
    });
    
    await whatsapp.sendTextMessage(client.whatsapp, message);
    
    // Registrar log
    await WhatsAppLog.create({
      order_id: order.id,
      client_id: client.id,
      phone_number: client.whatsapp,
      message_type: 'order_created',
      direction: 'outbound',
      message_text: message,
      status: 'sent',
      sent_at: new Date(),
    });
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'OS criada e confirmação enviada via WhatsApp',
    });
  } catch (error) {
    // ...
  }
}
```

### 2. Enviar orçamento com link de aprovação

```javascript
async function sendQuote(req, res) {
  try {
    // ... criar orçamento ...
    
    // Gerar token único para aprovação
    const approvalToken = jwt.sign(
      { quoteId: quote.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const approvalLink = `${process.env.FRONTEND_URL}/approve/${approvalToken}`;
    
    const whatsapp = getWhatsAppService();
    const message = messageTemplates.quoteSent({
      quoteNumber: quote.quote_number,
      clientName: client.name,
      total: quote.total,
      validUntil: formatDate(quote.valid_until),
      approvalLink,
    });
    
    await whatsapp.sendTextMessage(client.whatsapp, message);
    
    // Enviar PDF do orçamento
    const pdfPath = await generateQuotePDF(quote);
    await whatsapp.sendDocument(
      client.whatsapp,
      pdfPath,
      `${quote.quote_number}.pdf`
    );
    
    res.status(200).json({
      success: true,
      data: { quote, approvalLink },
      message: 'Orçamento enviado via WhatsApp',
    });
  } catch (error) {
    // ...
  }
}
```

### 3. Lembrete automático de visita (Cron Job)

```javascript
// Em jobs/visitReminders.js
const cron = require('node-cron');
const { Op } = require('sequelize');

// Executar todos os dias às 18h
cron.schedule('0 18 * * *', async () => {
  try {
    console.log('🔔 Enviando lembretes de visita...');
    
    // Buscar OS agendadas para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    const orders = await ServiceOrder.findAll({
      where: {
        scheduled_date: {
          [Op.between]: [tomorrow, tomorrowEnd],
        },
        status: {
          [Op.in]: ['assigned', 'in_progress'],
        },
      },
      include: [
        { model: Client },
        { model: Technician, include: [User] },
        { model: Address },
      ],
    });
    
    const whatsapp = getWhatsAppService();
    
    for (const order of orders) {
      const message = messageTemplates.visitReminder({
        clientName: order.Client.name,
        orderNumber: order.order_number,
        scheduledDate: formatDateTime(order.scheduled_date),
        technicianName: order.Technician.User.name,
        address: formatAddress(order.Address),
      });
      
      await whatsapp.sendTextMessage(order.Client.whatsapp, message);
      
      await WhatsAppLog.create({
        order_id: order.id,
        client_id: order.client_id,
        phone_number: order.Client.whatsapp,
        message_type: 'visit_reminder',
        direction: 'outbound',
        message_text: message,
        status: 'sent',
        sent_at: new Date(),
      });
    }
    
    console.log(`✅ ${orders.length} lembretes enviados`);
  } catch (error) {
    console.error('❌ Erro ao enviar lembretes:', error);
  }
});
```

## 🚀 Inicialização

### No app.js principal

```javascript
const express = require('express');
const { getWhatsAppService } = require('./services/whatsapp/whatsappService');

const app = express();

// ... configurações do Express ...

// Inicializar WhatsApp Service
(async () => {
  try {
    const whatsapp = getWhatsAppService();
    await whatsapp.initialize();
    console.log('✅ WhatsApp Service pronto!');
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
    console.log('⚠️  Continuando sem WhatsApp...');
  }
})();

// ... resto do app ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```

## 🔍 Monitoramento

### Rota para verificar status

```javascript
// Em routes/whatsapp.routes.js
router.get('/status', async (req, res) => {
  try {
    const whatsapp = getWhatsAppService();
    const info = whatsapp.getConnectionInfo();
    
    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

## 📊 Logs e Análise

### Dashboard de mensagens

```sql
-- Mensagens enviadas hoje
SELECT 
  COUNT(*) as total_sent,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM whatsapp_logs
WHERE DATE(sent_at) = CURRENT_DATE
  AND direction = 'outbound';

-- Taxa de abertura por tipo de mensagem
SELECT 
  message_type,
  COUNT(*) as total,
  SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as read_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (read_at - sent_at))/60), 2) as avg_read_time_minutes
FROM whatsapp_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
  AND direction = 'outbound'
GROUP BY message_type;
```

## ⚠️ Boas Práticas

### 1. Evitar Banimento
- Não envie mais de 30 mensagens por minuto
- Adicione delay entre mensagens (1-2 segundos)
- Não envie spam
- Respeite horários comerciais (9h-18h)

### 2. Reconexão Automática
- Implementado no código acima
- Salva sessão em disco
- Reconecta automaticamente se cair

### 3. Tratamento de Erros
- Sempre usar try/catch
- Registrar falhas no banco
- Implementar retry com backoff exponencial

### 4. Mensagens Profissionais
- Use emojis com moderação
- Mantenha tom profissional
- Inclua informações relevantes
- Adicione call-to-action claros

## 🔄 Alternativas Futuras

Se necessário migrar para API oficial:

### Meta WhatsApp Business API
- **Custo**: A partir de $0.005 por mensagem
- **Vantagens**: Oficial, suporte, webhooks
- **Requer**: Aprovação do Facebook, Business Manager

### Z-API / Ultramsg / Evolution API
- **Custo**: ~R$50-200/mês
- **Vantagens**: Gerenciado, múltiplas sessões
- **Migração**: Trocar apenas o whatsappService.js

## 📚 Recursos

- **Baileys Docs**: https://github.com/WhiskeySockets/Baileys
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Evolution API** (alternativa open-source): https://github.com/EvolutionAPI/evolution-api

---

✅ **Pronto para usar! Totalmente gratuito!**
