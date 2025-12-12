const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Placeholder para rotas financeiras
router.get('/summary', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Resumo financeiro' });
});

router.get('/payments', authenticate, async (req, res) => {
  res.json({ success: true, data: { payments: [] }, message: 'Implementar: Listar pagamentos' });
});

router.post('/payments', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Registrar pagamento' });
});

router.get('/reports/monthly', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Relatório mensal' });
});

module.exports = router;
