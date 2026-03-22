const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc   Generate suggested cart based on order history
// @route  GET /api/autocart
// @access Private
const getAutoCart = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).lean();

    if (orders.length === 0) {
      return res.json({
        success: true,
        message: 'No order history found. Place some orders first!',
        suggestions: [],
      });
    }

    // Count frequency of each product ordered
    const productFreq = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const pid = item.product.toString();
        if (!productFreq[pid]) {
          productFreq[pid] = { count: 0, totalQty: 0, name: item.name, image: item.image, price: item.price };
        }
        productFreq[pid].count += 1;           // frequency of orders
        productFreq[pid].totalQty += item.quantity;
      });
    });

    // Sort by order frequency
    const sortedProducts = Object.entries(productFreq)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    // Build suggested cart with avg quantity
    const suggestions = sortedProducts.map(([productId, data]) => ({
      productId,
      name: data.name,
      image: data.image,
      price: data.price,
      suggestedQuantity: Math.max(1, Math.round(data.totalQty / data.count)),
      orderedTimes: data.count,
    }));

    // Verify products still exist and are in stock
    const productIds = suggestions.map(s => s.productId);
    const liveProducts = await Product.find({ _id: { $in: productIds }, stock: { $gt: 0 } }).lean();
    const liveIds = new Set(liveProducts.map(p => p._id.toString()));

    const filteredSuggestions = suggestions
      .filter(s => liveIds.has(s.productId))
      .map(s => {
        const live = liveProducts.find(p => p._id.toString() === s.productId);
        return {
          ...s,
          currentPrice: live.price,
          category: live.category,
          stock: live.stock,
        };
      });

    res.json({
      success: true,
      count: filteredSuggestions.length,
      suggestions: filteredSuggestions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAutoCart };
