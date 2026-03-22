const express = require('express');
const router = express.Router();
const { checkout, getOrders, getOrderById, downloadInvoice } = require('../controllers/orderController');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);  // All order routes are protected

router.post('/', checkout);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', downloadInvoice);

// Payment routes
router.post('/:id/pay', createRazorpayOrder);
router.post('/:id/verify-payment', verifyRazorpayPayment);

module.exports = router;

