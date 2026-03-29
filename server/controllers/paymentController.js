const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

// @desc    Create Razorpay Order
// @route   POST /api/orders/:id/pay
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
    });

    const options = {
      amount: Math.round(order.totalAmount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: order._id.toString(),
    };

    const razorpayOrder = await instance.orders.create(options);

    res.json({
      success: true,
      data: {
        id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
      },
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/:id/verify-payment
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentMethod = 'Razorpay';
      order.paymentResult = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      };

      await order.save();
      
      // Populate user to get email and name for the email
      await order.populate('user', 'name email');

      const emailHtml = `
        <h2>Payment Successful</h2>
        <p>Hi ${order.user.name},</p>
        <p>We've received your payment of <strong>₹${order.totalAmount}</strong> for order <strong>#${order._id}</strong>.</p>
        <p>Thank you for choosing Grow Carry! We will notify you when your order ships.</p>
      `;
      sendEmail({ to: order.user.email, subject: 'Grow Carry - Payment Successful', html: emailHtml });

      res.json({ success: true, message: 'Payment verified successfully', order });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
