const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

router.get('/', authenticate, authorize('admin', 'manager'), userController.listUsers);
router.get('/technicians', authenticate, userController.listTechnicians);
router.get('/:id', authenticate, userController.getUser);
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);

module.exports = router;
