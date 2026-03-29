const Product = require('../models/Product');

// Intent patterns — keyword based rule matching
const INTENTS = [
  {
    name: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'howdy'],
  },
  {
    name: 'search',
    keywords: ['find', 'search', 'show me', 'looking for', 'i need', 'do you have', 'whats available'],
  },
  {
    name: 'show_category',
    keywords: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'beverages', 'snacks', 'frozen', 'pantry'],
    isCategory: true,
  },
  {
    name: 'add_to_cart',
    keywords: ['add', 'add to cart', 'put in cart', 'cart', 'buy'],
  },
  {
    name: 'checkout',
    keywords: ['checkout', 'place order', 'order now', 'buy now', 'proceed', 'payment'],
  },
  {
    name: 'help',
    keywords: ['help', 'what can you do', 'commands', 'options', 'support'],
  },
  {
    name: 'recommendations',
    keywords: ['recommend', 'suggestion', 'suggest', 'what should i buy', 'popular', 'best'],
  },
  {
    name: 'price',
    keywords: ['price', 'cost', 'how much', 'cheap', 'expensive', 'affordable'],
  },
];

const detectIntent = (message) => {
  const lower = message.toLowerCase();

  for (const intent of INTENTS) {
    for (const keyword of intent.keywords) {
      if (lower.includes(keyword)) {
        return { name: intent.name, isCategory: intent.isCategory || false, matchedKeyword: keyword };
      }
    }
  }
  return { name: 'unknown', isCategory: false, matchedKeyword: null };
};

// Extract category from message
const extractCategory = (message) => {
  const categories = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Pantry'];
  const lower = message.toLowerCase();
  return categories.find(cat => lower.includes(cat.toLowerCase())) || null;
};

// @desc   Handle chatbot message
// @route  POST /api/chatbot
// @access Public
const handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const intent = detectIntent(message);
    let response = '';
    let data = null;
    let action = null;

    switch (intent.name) {
      case 'greeting':
        response = `👋 Hello! Welcome to Grow Carry! I can help you find products, explore categories, add items to your cart, or checkout. What are you looking for?`;
        break;

      case 'help':
        response = `🤖 Here's what I can do:\n• Search for products (e.g., "find apples")\n• Show categories (e.g., "show fruits")\n• Add to cart (e.g., "add milk to cart")\n• Checkout (e.g., "checkout")\n• Recommendations (e.g., "what should I buy?")`;
        break;

      case 'show_category':
      case 'search': {
        const category = extractCategory(message);
        // Extract product name from message for direct search
        const searchTerms = message.toLowerCase()
          .replace(/find|search|show|me|i|need|looking|for|have|you|do|available|of/g, '')
          .trim();

        const query = {};
        if (category) query.category = category;
        else if (searchTerms.length > 2) {
          query.$or = [
            { name: { $regex: searchTerms, $options: 'i' } },
            { category: { $regex: searchTerms, $options: 'i' } },
          ];
        }

        const products = await Product.find(query).limit(5).lean();
        if (products.length > 0) {
          response = `🛍️ Found ${products.length} product(s) for you!`;
          data = products;
          action = 'show_products';
        } else {
          response = `😕 Sorry, I couldn't find any products matching "${message}". Try browsing our categories!`;
        }
        break;
      }

      case 'add_to_cart':
        response = `🛒 To add a product to your cart, click the "Add to Cart" button on the product card, or browse the Products page!`;
        action = 'navigate_products';
        break;

      case 'checkout':
        response = `💳 Ready to checkout? Head to your cart and click "Place Order"!`;
        action = 'navigate_cart';
        break;

      case 'recommendations':
        response = `⭐ Check out our "Recommended For You" section on the Products page — we pick items based on your order history!`;
        action = 'navigate_products';
        break;

      case 'price':
        response = `💰 You can sort products by price on the Products page using the sort filter. We have great deals every day!`;
        action = 'navigate_products';
        break;

      default:
        response = `🤔 I didn't quite understand that. Try asking me to "show vegetables", "find milk", or type "help" to see what I can do!`;
    }

    res.json({
      success: true,
      intent: intent.name,
      response,
      data,
      action,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleChat };
