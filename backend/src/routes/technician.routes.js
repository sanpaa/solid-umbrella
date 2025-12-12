const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Placeholder para rotas de técnicos
router.get('/', authenticate, async (req, res) => {
  res.json({ success: true, data: { technicians: [] }, message: 'Implementar: Listar técnicos' });
});

router.get('/:id', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: `Implementar: Obter técnico ${req.params.id}` });
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Criar técnico' });
});

router.patch('/:id/availability', authenticate, async (req, res) => {
  res.json({ success: true, message: `Implementar: Alterar disponibilidade técnico ${req.params.id}` });
});

module.exports = router;
