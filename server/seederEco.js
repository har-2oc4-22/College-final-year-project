const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load env vars
dotenv.config();

// Connect DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const assignEcoData = async () => {
    try {
        await connectDB();
        const products = await Product.find({});
        
        for (const product of products) {
            // Random eco score between 55 and 99
            const randomScore = Math.floor(Math.random() * (99 - 55 + 1) + 55);
            let impact = 'Moderate Check';

            if (randomScore >= 90) {
                impact = 'Planet Hero';
            } else if (randomScore >= 75) {
                impact = 'Eco-Friendly';
            } else if (randomScore < 60) {
                impact = 'High Carbon Footprint';
            }

            product.ecoScore = randomScore;
            product.ecoImpact = impact;
            await product.save();
        }

        console.log(`✅ successfully updated ${products.length} products with Eco Metrics!`);
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

assignEcoData();
