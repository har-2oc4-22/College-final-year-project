const express = require('express');
const router = express.Router();
const { getNutritionDashboard, seedNutritionForProduct } = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, getNutritionDashboard);
router.put('/seed-product/:id', protect, adminOnly, seedNutritionForProduct);

module.exports = router;
