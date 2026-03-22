const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Fresh', 'Expiring Soon', 'Expired', 'Consumed'],
    default: 'Fresh'
  }
});

const pantrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [pantryItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Pantry', pantrySchema);
