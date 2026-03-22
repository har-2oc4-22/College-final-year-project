const Order = require('../models/Order');

// @desc   Get aggregated nutrition stats from user's recent orders
// @route  GET /api/nutrition/dashboard
// @access Private
const getNutritionDashboard = async (req, res, next) => {
  try {
    // Get last 4 completed orders for nutrition calc
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name nutritionInfo category')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    let itemsAnalyzed = 0;
    const weeklyBreakdown = {};

    for (const order of orders) {
      for (const item of order.items || []) {
        const p = item.product;
        if (!p || !p.nutritionInfo) continue;
        
        const qty = item.quantity || 1;
        totals.calories += (p.nutritionInfo.calories || 0) * qty;
        totals.protein  += (p.nutritionInfo.protein  || 0) * qty;
        totals.carbs    += (p.nutritionInfo.carbs    || 0) * qty;
        totals.fat      += (p.nutritionInfo.fat      || 0) * qty;
        totals.fiber    += (p.nutritionInfo.fiber    || 0) * qty;
        itemsAnalyzed++;

        // Category breakdown
        const cat = p.category || 'Other';
        weeklyBreakdown[cat] = (weeklyBreakdown[cat] || 0) + 1;
      }
    }

    // Build chart-friendly breakdown array
    const categoryBreakdown = Object.entries(weeklyBreakdown).map(([name, count]) => ({ name, count }));

    // Nutritional rating score (out of 100)
    let score = 50;
    if (totals.protein > 200) score += 20;
    if (totals.fiber > 50) score += 15;
    if (totals.fat < 500) score += 15;
    score = Math.min(score, 100);

    res.json({
      success: true,
      ordersAnalyzed: orders.length,
      itemsAnalyzed,
      totals: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        fiber: Math.round(totals.fiber)
      },
      categoryBreakdown,
      nutritionScore: score,
      advice: score >= 80 ? '🌟 Excellent balance! Keep it up.' :
               score >= 60 ? '👍 Good choices, add more fiber-rich items.' :
               '⚠️ Try adding more vegetables and proteins to your cart.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Seed a product with realistic nutrition info (admin util)
// @route  PUT /api/nutrition/seed-product/:id
// @access Admin
const seedNutritionForProduct = async (req, res) => {
  const Product = require('../models/Product');
  const { calories, protein, carbs, fat, fiber } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, {
    nutritionInfo: { calories, protein, carbs, fat, fiber }
  }, { new: true });
  res.json({ success: true, product });
};

module.exports = { getNutritionDashboard, seedNutritionForProduct };
