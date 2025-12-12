const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const quoteController = require('../controllers/quote.controller');

router.get('/', authenticate, quoteController.listQuotes);
router.get('/:id', authenticate, quoteController.getQuote);
router.post('/', authenticate, authorize('admin', 'manager'), quoteController.createQuote);
router.patch('/:id/approve', authenticate, quoteController.approveQuote);
router.patch('/:id/reject', authenticate, quoteController.rejectQuote);
router.post('/:id/send', authenticate, authorize('admin', 'manager'), quoteController.sendQuote);

module.exports = router;
