const express = require('express');
const router = express.Router();
const { optimizeBudget } = require('../controllers/budgetPlannerController');
const { protect } = require('../middleware/auth');

router.post('/optimize', protect, optimizeBudget);

module.exports = router;
