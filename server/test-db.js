const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB Connected');
    
    const queries = ['apple', 'milk', 'bread', 'banana'];
    for (const q of queries) {
      const match = await Product.findOne({ 
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      }).lean();
      if (match) {
        console.log(`Found ${q}:`, match.name);
      } else {
        console.log(`NOT FOUND ${q}`);
      }
    }
    
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
