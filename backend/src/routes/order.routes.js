const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Placeholder para rotas de ordens de serviço
router.get('/', authenticate, async (req, res) => {
  res.json({ success: true, data: { orders: [] }, message: 'Implementar: Listar OS' });
});

router.get('/:id', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: `Implementar: Obter OS ${req.params.id}` });
});

router.post('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Criar OS' });
});

router.put('/:id', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: `Implementar: Atualizar OS ${req.params.id}` });
});

router.patch('/:id/status', authenticate, async (req, res) => {
  res.json({ success: true, message: `Implementar: Atualizar status OS ${req.params.id}` });
});

router.patch('/:id/assign', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json({ success: true, message: `Implementar: Atribuir técnico OS ${req.params.id}` });
});

router.post('/:id/photos', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: `Implementar: Adicionar fotos OS ${req.params.id}` });
});

module.exports = router;
