const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc   Get product recommendations for user
// @route  GET /api/recommendations
// @access Private
const getRecommendations = async (req, res, next) => {
  try {
    // Step 1: Get user's past orders
    const orders = await Order.find({ user: req.user._id }).lean();

    let recommendedProducts = [];

    if (orders.length === 0) {
      // New user: return top-rated products
      recommendedProducts = await Product.find({ stock: { $gt: 0 } })
        .sort({ rating: -1 })
        .limit(5);
      return res.json({ success: true, source: 'top_rated', products: recommendedProducts });
    }

    // Step 2: Extract categories and product frequency from order history
    const categoryCount = {};
    const productCount = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const pid = item.product.toString();
        productCount[pid] = (productCount[pid] || 0) + item.quantity;
      });
    });

    // Step 3: Get previously ordered products to find their categories
    const orderedProductIds = Object.keys(productCount);
    const orderedProducts = await Product.find({ _id: { $in: orderedProductIds } }).lean();

    orderedProducts.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + productCount[p._id.toString()];
    });

    // Step 4: Sort categories by frequency
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Step 5: Find top-rated products in those categories, excluding already-ordered ones
    recommendedProducts = await Product.find({
      category: { $in: topCategories },
      _id: { $nin: orderedProductIds },
      stock: { $gt: 0 },
    })
      .sort({ rating: -1 })
      .limit(5);

    // Fallback: if not enough, fill with top rated overall
    if (recommendedProducts.length < 5) {
      const extras = await Product.find({
        _id: { $nin: [...orderedProductIds, ...recommendedProducts.map(p => p._id)] },
        stock: { $gt: 0 },
      })
        .sort({ rating: -1 })
        .limit(5 - recommendedProducts.length);
      recommendedProducts = [...recommendedProducts, ...extras];
    }

    res.json({ success: true, source: 'order_history', topCategories, products: recommendedProducts });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };
