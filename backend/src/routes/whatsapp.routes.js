const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getWhatsAppService } = require('../services/whatsapp/whatsappService');

/**
 * GET /api/v1/whatsapp/status
 * Verificar status da conexão WhatsApp
 */
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const whatsapp = getWhatsAppService();
    const info = whatsapp.getConnectionInfo();

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/whatsapp/send
 * Enviar mensagem manual
 */
router.post('/send', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { phone_number, message, order_id } = req.body;

    if (!phone_number || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Número de telefone e mensagem são obrigatórios',
        },
      });
    }

    const whatsapp = getWhatsAppService();
    const result = await whatsapp.sendTextMessage(phone_number, message);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SEND_FAILED',
          message: result.error,
        },
      });
    }

    // TODO: Registrar em whatsapp_logs

    res.json({
      success: true,
      data: result,
      message: 'Mensagem enviada com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/whatsapp/qr
 * Obter QR code para pareamento
 */
router.get('/qr', authenticate, async (req, res, next) => {
  try {
    const whatsapp = getWhatsAppService();
    const qr = whatsapp.getCurrentQR();
    const info = whatsapp.getConnectionInfo();

    if (!qr && info.connected) {
      return res.json({
        success: true,
        data: {
          qrCode: null,
          connected: true,
          phoneNumber: info.phoneNumber,
        },
        message: 'WhatsApp já está conectado',
      });
    }

    res.json({
      success: true,
      data: {
        qrCode: qr,
        connected: info.connected,
        phoneNumber: info.phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/whatsapp/disconnect
 * Desconectar WhatsApp
 */
router.post('/disconnect', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const whatsapp = getWhatsAppService();
    await whatsapp.disconnect();

    res.json({
      success: true,
      message: 'WhatsApp desconectado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/whatsapp/logs
 * Obter histórico de mensagens
 */
router.get('/logs', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: { logs: [] },
    message: 'Implementar: Listar logs do WhatsApp',
  });
});

module.exports = router;
