const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  // Fruits
  { name: 'Fresh Apples', category: 'Fruits', price: 120, description: 'Crisp and juicy red apples', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', stock: 150, rating: 4.5, unit: 'kg' },
  { name: 'Bananas', category: 'Fruits', price: 40, description: 'Sweet ripe bananas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', stock: 200, rating: 4.3, unit: 'dozen' },
  { name: 'Oranges', category: 'Fruits', price: 80, description: 'Fresh and juicy oranges', image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400', stock: 120, rating: 4.4, unit: 'kg' },
  { name: 'Mango', category: 'Fruits', price: 200, description: 'Alphonso mangoes - King of fruits', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', stock: 80, rating: 4.9, unit: 'kg' },
  { name: 'Grapes', category: 'Fruits', price: 90, description: 'Seedless green grapes', image: 'https://images.unsplash.com/photo-1517814885702-03e66a1c3d46?w=400', stock: 100, rating: 4.2, unit: 'kg' },
  // Vegetables
  { name: 'Tomatoes', category: 'Vegetables', price: 30, description: 'Farm-fresh red tomatoes', image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400', stock: 200, rating: 4.1, unit: 'kg' },
  { name: 'Spinach', category: 'Vegetables', price: 25, description: 'Fresh organic spinach leaves', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', stock: 150, rating: 4.0, unit: 'bunch' },
  { name: 'Onions', category: 'Vegetables', price: 35, description: 'Red onions - essential for cooking', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', stock: 300, rating: 4.3, unit: 'kg' },
  { name: 'Potatoes', category: 'Vegetables', price: 30, description: 'Fresh potatoes for all dishes', image: 'https://images.unsplash.com/photo-1518977676405-d35855937c27?w=400', stock: 250, rating: 4.2, unit: 'kg' },
  { name: 'Capsicum', category: 'Vegetables', price: 60, description: 'Colorful bell peppers', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', stock: 100, rating: 4.1, unit: 'piece' },
  // Dairy
  { name: 'Full Cream Milk', category: 'Dairy', price: 60, description: 'Fresh full-cream milk daily delivered', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', stock: 300, rating: 4.6, unit: 'litre' },
  { name: 'Paneer', category: 'Dairy', price: 90, description: 'Fresh cottage cheese / paneer', image: 'https://images.unsplash.com/photo-1631452180775-6a2e9d1e4d78?w=400', stock: 100, rating: 4.5, unit: '200g' },
  { name: 'Curd', category: 'Dairy', price: 40, description: 'Thick homemade-style curd', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', stock: 150, rating: 4.4, unit: '400g' },
  { name: 'Butter', category: 'Dairy', price: 55, description: 'Amul salted butter', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', stock: 200, rating: 4.7, unit: '100g' },
  // Bakery
  { name: 'Whole Wheat Bread', category: 'Bakery', price: 45, description: 'Soft whole wheat sandwich bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', stock: 100, rating: 4.2, unit: 'loaf' },
  { name: 'Croissant', category: 'Bakery', price: 35, description: 'Buttery flaky croissants', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', stock: 60, rating: 4.5, unit: 'piece' },
  // Beverages
  { name: 'Orange Juice', category: 'Beverages', price: 85, description: '100% fresh orange juice, no sugar added', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', stock: 80, rating: 4.3, unit: '1L' },
  { name: 'Green Tea', category: 'Beverages', price: 120, description: 'Premium green tea bags', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', stock: 120, rating: 4.6, unit: '25 bags' },
  // Snacks
  { name: 'Mixed Nuts', category: 'Snacks', price: 180, description: 'Premium roasted mixed nuts', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', stock: 100, rating: 4.7, unit: '250g' },
  { name: 'Dark Chocolate', category: 'Snacks', price: 95, description: '70% cocoa dark chocolate bar', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', stock: 150, rating: 4.8, unit: '90g' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    const inserted = await Product.insertMany(products);
    console.log(`🌱 Seeded ${inserted.length} products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
