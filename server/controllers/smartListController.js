const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

// Removed top-level genAI initialization to ensure environment variables are loaded properly per-request.

// @desc   Parse grocery list (text or image) and match with database
// @route  POST /api/smart-cart/parse
// @access Private
const parseGroceryList = async (req, res, next) => {
  try {
    const { text, imageBase64 } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ success: false, message: 'Please provide text or an image payload.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gemini AI is not configured. Please set GEMINI_API_KEY in server/.env and restart.' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are an expert grocery AI assistant. The user has provided a grocery list or a spoken command.
      Extract the generic, fundamental name of the grocery items in SINGULAR form (e.g., if the user says "can you add some fresh red apples", return "apple". If they say "2 bottles of milk", return "milk").
      Extract their quantities as numbers. If a quantity isn't specified, default to 1.
      Return strictly a JSON array of objects with keys "item" (string) and "quantity" (number).
      Do not wrap it in markdown block quotes. Just the raw JSON array.
    `;

    let contentParts = [];
    if (text) {
      contentParts.push(prompt + '\n\nList:\n' + text);
    } else if (imageBase64) {
      const mimeTypeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      contentParts.push({
        inlineData: {
          data: base64Data,
          mimeType
        }
      });
      contentParts.push(prompt);
    }

    const result = await model.generateContent(contentParts);
    const responseText = result.response.text();

    let extractedItems = [];
    try {
      let respText = responseText;
      const jsonMatch = respText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        respText = jsonMatch[0];
      } else {
        respText = respText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      extractedItems = JSON.parse(respText);
    } catch (parseErr) {
      console.error("AI Parse Error:", parseErr, responseText);
      return res.status(500).json({ success: false, message: 'Failed to parse AI response.', raw: responseText });
    }

    if (!Array.isArray(extractedItems)) {
      extractedItems = [extractedItems];
    }

    // Match extracted items against the MongoDB Product Collection
    const matchedProducts = [];
    
    for (const aiItem of extractedItems) {
      // Split words to make regex extremely flexible (e.g. "red apple" matches "Apple")
      const searchWords = aiItem.item.split(' ').filter(w => w.length > 2);
      const orConditions = searchWords.map(word => ({ 
        $or: [
          { name: { $regex: word, $options: 'i' } },
          { category: { $regex: word, $options: 'i' } }
        ]
      }));

      // if short word
      if (orConditions.length === 0) {
        orConditions.push({ name: { $regex: aiItem.item, $options: 'i' } });
      }

      const match = await Product.findOne({ $and: orConditions }).lean() 
                 || await Product.findOne({ $or: orConditions.map(c => c.$or).flat() }).lean();

      if (match) {
        matchedProducts.push({
          product: match,
          requestedQuantity: Number(aiItem.quantity) || 1,
          found: true,
          originalText: aiItem.item
        });
      } else {
        matchedProducts.push({
          product: null,
          requestedQuantity: Number(aiItem.quantity) || 1,
          found: false,
          originalText: aiItem.item
        });
      }
    }

    res.json({
      success: true,
      extractedCount: extractedItems.length,
      matchedCount: matchedProducts.filter(m => m.found).length,
      items: matchedProducts
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { parseGroceryList };
