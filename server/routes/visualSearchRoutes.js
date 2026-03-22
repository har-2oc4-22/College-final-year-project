const express = require('express');
const router = express.Router();
const { visualSearch } = require('../controllers/visualSearchController');

router.post('/', visualSearch);

module.exports = router;
