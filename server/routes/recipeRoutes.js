const express = require('express');
const router = express.Router();
const { generateRecipe } = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateRecipe);

module.exports = router;
