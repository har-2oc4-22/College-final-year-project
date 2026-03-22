const express = require('express');
const router = express.Router();
const { advanceDelivery, getTracking } = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

router.get('/:orderId', protect, getTracking);
router.put('/:orderId/advance', protect, adminOnly, advanceDelivery);

module.exports = router;
