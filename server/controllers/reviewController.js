const Product = require('../models/Product');
const Order = require('../models/Order');

// POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user has bought and received this product
    const purchasedOrder = await Order.findOne({
      user: req.user._id,
      status: 'delivered',
      'items.product': product._id,
    });
    if (!purchasedOrder) {
      return res.status(403).json({ success: false, message: 'You can only review products you have purchased and received' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment: comment || '',
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: 'Review added', data: product.reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/:id/reviews
const getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('reviews rating numReviews');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product.reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/products/:id/reviews/:reviewId  (own review or admin)
const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    product.reviews.pull(req.params.reviewId);
    product.numReviews = product.reviews.length;
    product.rating = product.numReviews
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews
      : 0;

    await product.save();
    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addReview, getReviews, deleteReview };
