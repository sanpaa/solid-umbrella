const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

router.get('/', authenticate, orderController.listOrders);
router.get('/:id', authenticate, orderController.getOrder);
router.post('/', authenticate, authorize('admin', 'manager'), orderController.createOrder);
router.put('/:id', authenticate, orderController.updateOrder);
router.patch('/:id/status', authenticate, orderController.updateStatus);
router.patch('/:id/assign', authenticate, authorize('admin', 'manager'), orderController.assignTechnician);

module.exports = router;
