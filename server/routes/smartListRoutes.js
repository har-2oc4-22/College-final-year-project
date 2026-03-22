const express = require('express');
const router = express.Router();
const { parseGroceryList } = require('../controllers/smartListController');
const { protect } = require('../middleware/auth');

router.post('/parse', parseGroceryList);

module.exports = router;
