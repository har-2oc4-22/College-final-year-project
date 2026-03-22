const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc   Get user's cart
// @route  GET /api/cart
// @access Private
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.json({ success: true, cart: { items: [], totalAmount: 0 } });

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
  } catch (error) {
    next(error);
  }
};

// @desc   Add item to cart
// @route  POST /api/cart
// @access Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += parseInt(quantity);
      } else {
        cart.items.push({ product: productId, quantity: parseInt(quantity) });
      }
      await cart.save();
    }

    await cart.populate('items.product');
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
  } catch (error) {
    next(error);
  }
};

// @desc   Update cart item quantity
// @route  PUT /api/cart/:productId
// @access Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(i => i.product.toString() === req.params.productId);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = parseInt(quantity);
    }

    await cart.save();
    await cart.populate('items.product');
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
  } catch (error) {
    next(error);
  }
};

// @desc   Remove item from cart
// @route  DELETE /api/cart/:productId
// @access Private
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.product');
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
  } catch (error) {
    next(error);
  }
};

// @desc   Clear entire cart
// @route  DELETE /api/cart
// @access Private
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
