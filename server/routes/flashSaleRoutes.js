const express = require('express');
const router = express.Router();
const { launchFlashSale, cancelFlashSale, getActiveFlashSales } = require('../controllers/flashSaleController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

router.get('/active', getActiveFlashSales);
router.post('/:id/launch', protect, adminOnly, launchFlashSale);
router.delete('/:id/cancel', protect, adminOnly, cancelFlashSale);

module.exports = router;
