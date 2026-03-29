const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

// Removed top-level genAI initialization.

// @desc   Identify a product from an image and search the store
// @route  POST /api/visual-search
// @access Public
const visualSearch = async (req, res, next) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'No image provided.' });
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Gemini AI not configured.' });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const mimeTypeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are a grocery product identifier. Look at this image and identify what grocery product or food item it is.
Return ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "productName": "most likely grocery product name",
  "category": "one of: Fruits, Vegetables, Dairy, Meat, Bakery, Beverages, Snacks, Frozen, Pantry, Other",
  "confidence": "high/medium/low",
  "searchTerms": ["term1", "term2"]
}`;

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      prompt
    ]);

    let identified;
    try {
      let raw = result.response.text();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        raw = jsonMatch[0];
      } else {
        raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      identified = JSON.parse(raw);
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to parse AI response.' });
    }

    // Search our database with all returned terms
    const searchQueries = [identified.productName, ...(identified.searchTerms || [])];
    const regexOrs = searchQueries.map(term => ({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ]
    }));

    let products = await Product.find({ $or: regexOrs.flatMap(q => q.$or) }).limit(8).lean();

    // Fallback: search by category
    if (products.length === 0 && identified.category) {
      products = await Product.find({ category: identified.category }).limit(8).lean();
    }

    res.json({
      success: true,
      identified: {
        name: identified.productName,
        category: identified.category,
        confidence: identified.confidence
      },
      products
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { visualSearch };
