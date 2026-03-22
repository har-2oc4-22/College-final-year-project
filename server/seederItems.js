const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// Comprehensive placeholder product database
const additionalProducts = [
  // Bakery
  { name: 'Artisan Sourdough Loaf', category: 'Bakery', price: 5.99, description: 'Freshly baked organic sourdough bread with a crispy crust and chewy center.', image: 'https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?w=600', stock: 15, rating: 4.8, numReviews: 12 },
  { name: 'French Butter Croissants', category: 'Bakery', price: 4.49, description: 'Pack of 4 authentic flaky butter croissants.', image: 'https://images.unsplash.com/photo-1555507036-ab1e4006a2a0?w=600', stock: 25, rating: 4.9, numReviews: 30 },
  { name: 'Whole Wheat Bagels', category: 'Bakery', price: 3.99, description: 'Pack of 6 dense and chewy whole grain bagels.', image: 'https://images.unsplash.com/photo-1600865768806-03f4337b51e6?w=600', stock: 20, rating: 4.5, numReviews: 8 },
  { name: 'Blueberry Muffins', category: 'Bakery', price: 6.99, description: 'Freshly baked jumbo blueberry muffins (4-pack).', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600', stock: 10, rating: 4.6, numReviews: 15 },
  
  // Meat
  { name: 'Grass-Fed Ribeye Steak', category: 'Meat', price: 18.99, description: 'Premium cut 12oz grass-fed beef ribeye, perfect for grilling.', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600', stock: 30, rating: 4.9, numReviews: 45 },
  { name: 'Organic Chicken Breast', category: 'Meat', price: 10.49, description: 'Boneless, skinless organic free-range chicken breasts (1 lb).', image: 'https://images.unsplash.com/photo-1604503468506-a8da13fc6d50?w=600', stock: 50, rating: 4.7, numReviews: 60 },
  { name: 'Wild Caught Salmon Fillet', category: 'Meat', price: 14.99, description: 'Freshly caught Alaskan sockeye salmon fillet (8 oz).', image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600', stock: 20, rating: 4.8, numReviews: 22 },
  { name: 'Ground Turkey 93/7', category: 'Meat', price: 6.99, description: 'Lean ground turkey meat, great for burgers and tacos.', image: 'https://plus.unsplash.com/premium_photo-1664320959114-1b4e292021fb?w=600', stock: 40, rating: 4.5, numReviews: 18 },

  // Vegetables
  { name: 'Organic Spinach Bunch', category: 'Vegetables', price: 2.99, description: 'Fresh crunchy organic farm spinach.', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600', stock: 60, rating: 4.4, numReviews: 10 },
  { name: 'Cherry Tomatoes', category: 'Vegetables', price: 3.49, description: 'Sweet and juicy organic cherry tomatoes (1 pint).', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600', stock: 45, rating: 4.7, numReviews: 33 },
  { name: 'Bell Pepper Trio', category: 'Vegetables', price: 4.99, description: 'Pack of 3 colored bell peppers (Red, Yellow, Orange).', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600', stock: 35, rating: 4.6, numReviews: 14 },
  { name: 'Sweet Potatoes', category: 'Vegetables', price: 1.99, description: 'Locally grown organic sweet potatoes (per lb).', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600', stock: 100, rating: 4.8, numReviews: 40 },

  // Fruits
  { name: 'Fuji Apples', category: 'Fruits', price: 4.99, description: 'Crisp and sweet Fuji apples (3 lb bag).', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=600', stock: 55, rating: 4.7, numReviews: 20 },
  { name: 'Hass Avocados', category: 'Fruits', price: 5.99, description: 'Bag of 4 perfectly ripe Mexican Hass avocados.', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600', stock: 40, rating: 4.9, numReviews: 85 },
  { name: 'Organic Strawberries', category: 'Fruits', price: 4.49, description: 'Fresh organic strawberries (16 oz).', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600', stock: 25, rating: 4.6, numReviews: 32 },
  { name: 'Navel Oranges', category: 'Fruits', price: 6.49, description: 'Juicy and sweet navel oranges (4 lb bag).', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9db4323?w=600', stock: 30, rating: 4.5, numReviews: 11 },

  // Dairy
  { name: 'Organic Whole Milk', category: 'Dairy', price: 5.49, description: '1 Gallon of fresh organic whole milk.', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600', stock: 30, rating: 4.8, numReviews: 50 },
  { name: 'Greek Yogurt Vanilla', category: 'Dairy', price: 5.99, description: 'Thick and creamy vanilla Greek yogurt (32 oz).', image: 'https://images.unsplash.com/photo-1488477181946-6428a029a792?w=600', stock: 25, rating: 4.7, numReviews: 28 },
  { name: 'Sharp Cheddar Cheese', category: 'Dairy', price: 4.99, description: 'Aged sharp cheddar cheese block (8 oz).', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600', stock: 40, rating: 4.8, numReviews: 34 },
  { name: 'Salted Butter', category: 'Dairy', price: 3.99, description: 'Premium sweet cream salted butter (4 sticks).', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600', stock: 60, rating: 4.9, numReviews: 61 },

  // Pantry
  { name: 'Extra Virgin Olive Oil', category: 'Pantry', price: 12.99, description: 'Cold-pressed extra virgin olive oil (750ml).', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', stock: 20, rating: 4.9, numReviews: 70 },
  { name: 'Himalayan Pink Salt', category: 'Pantry', price: 6.49, description: 'Fine grain natural Himalayan pink salt.', image: 'https://images.unsplash.com/photo-1628189873499-52e8055a4ecb?w=600', stock: 50, rating: 4.8, numReviews: 15 },
  { name: 'Organic Maple Syrup', category: 'Pantry', price: 14.99, description: '100% pure Grade A dark color maple syrup.', image: 'https://images.unsplash.com/photo-1588725890835-f71f1eaec7fb?w=600', stock: 15, rating: 4.9, numReviews: 42 },
  { name: 'Jasmine Rice', category: 'Pantry', price: 8.99, description: 'Aromatic fragrant Thai jasmine rice (5 lb bag).', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600', stock: 35, rating: 4.7, numReviews: 24 },

  // Snacks
  { name: 'Sea Salt Potato Chips', category: 'Snacks', price: 3.99, description: 'Crispy kettle-cooked sea salt potato chips.', image: 'https://images.unsplash.com/photo-1566478989037-e50159ef31d8?w=600', stock: 80, rating: 4.5, numReviews: 55 },
  { name: 'Mixed Roasted Nuts', category: 'Snacks', price: 9.99, description: 'Unsalted mix of almonds, cashews, and walnuts.', image: 'https://images.unsplash.com/photo-1536588265538-2dfa61cd5797?w=600', stock: 30, rating: 4.8, numReviews: 38 },
  { name: 'Dark Chocolate Bar', category: 'Snacks', price: 4.49, description: 'Rich 72% cocoa dark chocolate vegan bar.', image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600', stock: 45, rating: 4.9, numReviews: 90 },

  // Frozen
  { name: 'Frozen Mixed Berries', category: 'Frozen', price: 7.99, description: 'Blend of frozen strawberries, blueberries, and raspberries.', image: 'https://images.unsplash.com/photo-1574676644837-25e227aeb828?w=600', stock: 25, rating: 4.7, numReviews: 19 },
  { name: 'Classic Vanilla Ice Cream', category: 'Frozen', price: 4.99, description: 'Rich and creamy classic vanilla bean ice cream (1.5 Qt).', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf802?w=600', stock: 20, rating: 4.8, numReviews: 44 },
  { name: 'Frozen Cheese Pizza', category: 'Frozen', price: 6.99, description: 'Stone-baked thin crust four cheese frozen pizza.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', stock: 35, rating: 4.4, numReviews: 60 }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected correctly...');

    // Just insert without clearing the database so we keep the old ones
    await Product.insertMany(additionalProducts);
    
    console.log(`✅ successfully added ${additionalProducts.length} new products!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();
