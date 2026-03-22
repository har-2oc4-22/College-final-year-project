const express = require('express');
const router = express.Router();
const { getAutoCart } = require('../controllers/autocartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAutoCart);

module.exports = router;
