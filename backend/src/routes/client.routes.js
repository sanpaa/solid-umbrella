const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const clientController = require('../controllers/client.controller');

router.get('/', authenticate, clientController.listClients);
router.get('/:id', authenticate, clientController.getClient);
router.post('/', authenticate, authorize('admin', 'manager'), clientController.createClient);
router.put('/:id', authenticate, authorize('admin', 'manager'), clientController.updateClient);
router.delete('/:id', authenticate, authorize('admin'), clientController.deleteClient);

module.exports = router;
