const Product = require('../models/Product');

// @desc   Admin: Launch a flash sale on a product
// @route  POST /api/flash-sale/:id/launch
// @access Admin
const launchFlashSale = async (req, res, next) => {
  try {
    const { discountPercent, durationMinutes } = req.body;
    if (!discountPercent || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'discountPercent and durationMinutes are required.' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const salePrice = product.price * (1 - discountPercent / 100);
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    product.flashSale = { active: true, discountPercent, salePrice: parseFloat(salePrice.toFixed(2)), expiresAt };
    await product.save();

    res.json({ success: true, message: `Flash sale launched! Expires at ${expiresAt.toISOString()}`, product });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: Cancel a flash sale on a product
// @route  DELETE /api/flash-sale/:id/cancel
// @access Admin
const cancelFlashSale = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.flashSale = { active: false, discountPercent: 0, salePrice: 0, expiresAt: null };
    await product.save();
    res.json({ success: true, message: 'Flash sale cancelled.', product });
  } catch (err) {
    next(err);
  }
};

// @desc   Public: Get all active flash sales (auto-expire stale ones)
// @route  GET /api/flash-sale/active
// @access Public
const getActiveFlashSales = async (req, res, next) => {
  try {
    // Auto-expire stale flash sales in-band 
    await Product.updateMany(
      { 'flashSale.active': true, 'flashSale.expiresAt': { $lte: new Date() } },
      { $set: { 'flashSale.active': false } }
    );

    const products = await Product.find({ 'flashSale.active': true }).lean();
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

module.exports = { launchFlashSale, cancelFlashSale, getActiveFlashSales };
