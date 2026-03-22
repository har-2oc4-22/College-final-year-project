const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (err) {
  console.error('Gemini AI init failed:', err);
}

// @desc   Generate an AI-optimized shopping cart within a budget
// @route  POST /api/budget-planner/optimize
// @access Private
const optimizeBudget = async (req, res, next) => {
  try {
    const { budget, preferences } = req.body;
    if (!budget || budget <= 0) {
      return res.status(400).json({ success: false, message: 'A valid budget is required.' });
    }
    if (!genAI) return res.status(500).json({ success: false, message: 'Gemini AI not configured.' });

    // Load a representative sample of available products from DB
    const allProducts = await Product.find({ stock: { $gt: 0 } })
      .select('name price category unit nutritionInfo')
      .limit(60)
      .lean();

    const productSummary = allProducts.map(p =>
      `${p.name} (${p.category}) - ₹${p.price}/${p.unit || 'piece'}`
    ).join('\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a smart grocery budget optimizer for an Indian household.
Budget: ₹${budget}
User Preferences: ${preferences || 'balanced nutrition, variety'}

Available products in the store:
${productSummary}

Create an optimal grocery list that:
1. Stays within the budget (sum of price * quantity must be <= ₹${budget})
2. Covers nutrition (proteins, carbs, vitamins)
3. Provides variety across categories
4. Prioritizes value for money

Return ONLY a JSON object:
{
  "tip": "One-line personalized tip",
  "estimatedTotal": 1250,
  "items": [
    { "name": "Product Name", "quantity": 2, "estimatedCost": 150, "reason": "Why this item" }
  ]
}`;

    const result = await model.generateContent(prompt);
    let plan;
    try {
      const raw = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      plan = JSON.parse(raw);
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to parse AI budget plan.' });
    }

    // Match AI suggestions to real database products
    const matchedItems = [];
    for (const aiItem of plan.items || []) {
      const match = await Product.findOne({
        name: { $regex: aiItem.name.split(' ')[0], $options: 'i' },
        stock: { $gt: 0 }
      }).lean();
      matchedItems.push({ ...aiItem, product: match || null, found: !!match });
    }

    res.json({
      success: true,
      budget,
      tip: plan.tip,
      estimatedTotal: plan.estimatedTotal,
      items: matchedItems
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { optimizeBudget };
