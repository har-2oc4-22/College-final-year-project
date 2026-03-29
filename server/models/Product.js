const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price must be a positive number'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Pantry', 'Other'],
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/200',
  },
  stock: {
    type: Number,
    required: true,
    default: 100,
    min: [0, 'Stock cannot be negative'],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    default: 'piece',  // e.g., kg, litre, piece
  },
  ecoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  ecoImpact: {
    type: String,
    enum: ['High Carbon Footprint', 'Moderate Check', 'Eco-Friendly', 'Planet Hero'],
    default: 'Moderate Check'
  },
  flashSale: {
    active: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null }
  },
  nutritionInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  carbonFootprint: {
    type: Number,
    default: 0,
    min: 0,
  },
  origin: {
    type: String,
    default: '',
  },
  isOrganic: {
    type: Boolean,
    default: false,
  },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
