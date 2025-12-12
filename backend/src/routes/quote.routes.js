const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Placeholder para rotas de orçamentos
router.get('/', authenticate, async (req, res) => {
  res.json({ success: true, data: { quotes: [] }, message: 'Implementar: Listar orçamentos' });
});

router.get('/:id', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: `Implementar: Obter orçamento ${req.params.id}` });
});

router.post('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Criar orçamento' });
});

router.patch('/:id/approve', async (req, res) => {
  res.json({ success: true, message: `Implementar: Aprovar orçamento ${req.params.id}` });
});

router.patch('/:id/reject', authenticate, async (req, res) => {
  res.json({ success: true, message: `Implementar: Rejeitar orçamento ${req.params.id}` });
});

router.get('/:id/pdf', authenticate, async (req, res) => {
  res.json({ success: true, message: `Implementar: Gerar PDF orçamento ${req.params.id}` });
});

module.exports = router;
