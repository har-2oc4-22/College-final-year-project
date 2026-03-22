const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const products = await Product.find({}, 'name category').lean();
    console.log(`Total Products: ${products.length}`);
    products.forEach(p => console.log(`- ${p.name} (Cat: ${p.category})`));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
