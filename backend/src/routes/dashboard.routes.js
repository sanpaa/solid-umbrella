const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Placeholder para rotas do dashboard
router.get('/overview', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Visão geral do dashboard' });
});

router.get('/charts', authenticate, async (req, res) => {
  res.json({ success: true, data: {}, message: 'Implementar: Dados para gráficos' });
});

module.exports = router;
