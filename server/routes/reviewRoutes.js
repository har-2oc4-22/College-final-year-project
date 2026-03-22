const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from productRoutes
const { protect, adminOnly } = require('../middleware/auth');
const { addReview, getReviews, deleteReview } = require('../controllers/reviewController');

router.get('/', getReviews);
router.post('/', protect, addReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
