const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  image: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' },
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay', 'UPI'],
    default: 'COD',
  },
  paymentResult: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: Date,
  pointsUsed: {
    type: Number,
    default: 0,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  deliveryAgent: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  deliveryTracking: [
    {
      stage: String,
      label: String,
      completedAt: Date,
      lat: Number,
      lng: Number,
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
