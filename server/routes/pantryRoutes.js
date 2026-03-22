const express = require('express');
const { getPantry, consumePantryItem } = require('../controllers/pantryController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPantry);

router.route('/:itemId/consume')
  .put(consumePantryItem);

module.exports = router;
