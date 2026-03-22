const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Pantry = require('../models/Pantry');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');

// @desc   Checkout - create order from cart
// @route  POST /api/orders
// @access Private
const checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
    }));

    let totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const user = await User.findById(req.user._id);
    let pointsUsed = parseInt(req.body.pointsUsed) || 0;

    // 1. Process points spending
    if (pointsUsed > 0) {
      if (user.freshPoints < pointsUsed) {
        return res.status(400).json({ success: false, message: 'Not enough FreshPoints available' });
      }
      totalAmount -= pointsUsed;
      if (totalAmount < 0) totalAmount = 0;
      user.freshPoints -= pointsUsed;
    }

    // 2. Process points earning (5% cashback on the final amount paid)
    const pointsEarned = Math.floor(totalAmount * 0.05);
    user.freshPoints += pointsEarned;
    await user.save();

    const isUPI = req.body.paymentMethod === 'UPI';

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: req.body.shippingAddress || {},
      paymentMethod: req.body.paymentMethod || 'COD',
      isPaid: isUPI,
      paidAt: isUPI ? Date.now() : null,
      pointsUsed,
      pointsEarned,
      ...(isUPI && {
        paymentResult: {
          razorpay_payment_id: req.body.upiTransactionId || 'UPI_SIMULATED',
        }
      })
    });

    // --- Auto-Add to Digital Pantry ---
    try {
      let pantry = await Pantry.findOne({ user: req.user._id });
      if (!pantry) {
        pantry = new Pantry({ user: req.user._id, items: [] });
      }

      const pantryItems = await Promise.all(orderItems.map(async (item) => {
        const productData = await Product.findById(item.product);
        let daysTillExpiry = 14; // Default
        if (productData) {
          if (['Fruits', 'Vegetables'].includes(productData.category)) daysTillExpiry = 7;
          else if (['Dairy', 'Meat'].includes(productData.category)) daysTillExpiry = 5;
          else if (productData.category === 'Bakery') daysTillExpiry = 4;
          else if (['Pantry', 'Snacks', 'Beverages', 'Frozen'].includes(productData.category)) daysTillExpiry = 180;
        }
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysTillExpiry);

        return {
          product: item.product,
          quantity: item.quantity,
          purchaseDate: new Date(),
          expiryDate,
          status: 'Fresh'
        };
      }));

      pantry.items.push(...pantryItems);
      await pantry.save();
    } catch (err) {
      console.error('Pantry Error:', err);
    }
    // ----------------------------------

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    // Send order confirmation email if COD or UPI
    if (['COD', 'UPI'].includes(order.paymentMethod)) {
      const emailHtml = `
        <h2>Order Confirmation</h2>
        <p>Hi ${req.user.name},</p>
        <p>Thank you for shopping at FreshMart! Your order (<strong>#${order._id}</strong>) has been successfully placed.</p>
        <p>Total Amount: <strong>₹${order.totalAmount}</strong> (${order.paymentMethod})</p>
        <p>We will notify you when it ships.</p>
      `;
      sendEmail({ to: req.user.email, subject: 'FreshMart - Order Placed', html: emailHtml });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all orders for logged-in user
// @route  GET /api/orders
// @access Private
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc   Download Invoice PDF
// @route  GET /api/orders/:id/invoice
// @access Private
const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this invoice' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text('FreshMart', { align: 'center' });
    doc.fontSize(10).text('123 Grocery Lane, Fresh City, 12345', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(16).text('INVOICE', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    doc.moveDown();
    
    doc.text('Bill To:');
    doc.text(`Name: ${order.user.name}`);
    doc.text(`Email: ${order.user.email}`);
    if (order.shippingAddress && order.shippingAddress.address) {
      doc.text(`Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`);
    }
    doc.moveDown();
    
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, doc.y, { continued: true });
    doc.text('Qty', 350, doc.y, { continued: true });
    doc.text('Price', 400, doc.y, { continued: true });
    doc.text('Total', 480, doc.y);
    doc.font('Helvetica');
    
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(1.5);
    
    let y = doc.y;
    order.items.forEach(item => {
      doc.text(item.name.substring(0, 35), 50, y, { width: 280 });
      doc.text(item.quantity.toString(), 350, y);
      doc.text(`Rs. ${item.price}`, 400, y);
      doc.text(`Rs. ${item.price * item.quantity}`, 480, y);
      y += 20;
    });
    
    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
    
    y += 25;
    doc.font('Helvetica-Bold');
    doc.text('Grand Total:', 350, y);
    doc.text(`Rs. ${order.totalAmount}`, 480, y);
    
    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkout, getOrders, getOrderById, downloadInvoice };
