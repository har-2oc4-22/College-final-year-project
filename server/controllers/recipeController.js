const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (err) {
  console.error('Failed to initialize Google Generative AI:', err);
}

// @desc   Generate a recipe and extract grocery ingredients to match DB
// @route  POST /api/recipes/generate
// @access Private
const generateRecipe = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a dish name or recipe idea.' });
    }

    if (!genAI) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gemini AI is not configured. Please set GEMINI_API_KEY in server/.env and restart.' 
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are a master chef. The user wants to cook: "${query}".
      Create a proper recipe for this dish. 
      Important: extract the core raw grocery ingredients needed.
      
      Respond STRICTLY with a JSON object in this exact format:
      {
        "recipeName": "Name of the dish",
        "description": "Short delicious description",
        "prepTime": "15 mins",
        "cookTime": "30 mins",
        "instructions": ["Step 1...", "Step 2..."],
        "ingredients": [
          {"item": "Chicken Breast", "quantity": 1},
          {"item": "Butter", "quantity": 1}
        ]
      }
      Do not include any other text except the JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let recipeData;
    try {
      const respText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      recipeData = JSON.parse(respText);
    } catch (parseErr) {
      return res.status(500).json({ success: false, message: 'Failed to parse AI response.', raw: responseText });
    }

    // Match extracted ingredients against the MongoDB Product Collection
    const matchedProducts = [];
    
    if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
      for (const aiItem of recipeData.ingredients) {
        const searchTerm = aiItem.item.replace(/[s]$/i, ''); // simple plural stripping
        
        const match = await Product.findOne({ 
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } }
          ]
        }).lean();

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
    }

    res.json({
      success: true,
      recipe: {
        name: recipeData.recipeName,
        description: recipeData.description,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        instructions: recipeData.instructions
      },
      matchedCount: matchedProducts.filter(m => m.found).length,
      ingredients: matchedProducts
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { generateRecipe };
