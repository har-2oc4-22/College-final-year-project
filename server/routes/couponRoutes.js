const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { validateCoupon, createCoupon, getAllCoupons, deleteCoupon } = require('../controllers/couponController');

// Public - validate coupon
router.post('/validate', protect, validateCoupon);

// Admin only
router.post('/', protect, adminOnly, createCoupon);
router.get('/', protect, adminOnly, getAllCoupons);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;
