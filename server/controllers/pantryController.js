const Pantry = require('../models/Pantry');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user pantry
// @route   GET /api/pantry
// @access  Private
exports.getPantry = asyncHandler(async (req, res, next) => {
  let pantry = await Pantry.findOne({ user: req.user.id }).populate('items.product');

  if (!pantry) {
    pantry = await Pantry.create({ user: req.user.id, items: [] });
  }

  // Auto-update status based on dates
  const now = new Date();
  let updated = false;

  pantry.items.forEach(item => {
    if (item.status !== 'Consumed' && item.status !== 'Expired') {
      const daysToExpiry = (new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24);
      if (daysToExpiry < 0 && item.status !== 'Expired') {
        item.status = 'Expired';
        updated = true;
      } else if (daysToExpiry >= 0 && daysToExpiry <= 3 && item.status !== 'Expiring Soon') {
        item.status = 'Expiring Soon';
        updated = true;
      }
    }
  });

  if (updated) {
    await pantry.save();
  }

  // Sort: Expiring soon / Fresh usually first, Consumed last. Or sort by expiryDate ASC
  pantry.items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  res.status(200).json({
    success: true,
    data: pantry
  });
});

// @desc    Mark item as consumed
// @route   PUT /api/pantry/:itemId/consume
// @access  Private
exports.consumePantryItem = asyncHandler(async (req, res, next) => {
  const pantry = await Pantry.findOne({ user: req.user.id });

  if (!pantry) {
    return next(new ErrorResponse('Pantry not found', 404));
  }

  const item = pantry.items.id(req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Pantry item not found', 404));
  }

  item.status = 'Consumed';
  await pantry.save();

  res.status(200).json({
    success: true,
    data: pantry.items.find(i => i._id.toString() === req.params.itemId)
  });
});
