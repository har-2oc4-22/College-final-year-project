const Order = require('../models/Order');

// Delivery stages with GPS coordinates (simulated for demo around Mumbai)
const DELIVERY_STAGES = [
  { stage: 'confirmed',   label: 'Order Confirmed',       lat: 19.0760, lng: 72.8777 },
  { stage: 'processing',  label: 'Being Prepared',         lat: 19.0810, lng: 72.8800 },
  { stage: 'picked-up',   label: 'Picked by Delivery Boy', lat: 19.0850, lng: 72.8820 },
  { stage: 'on-the-way',  label: 'On the Way',             lat: 19.0900, lng: 72.8850 },
  { stage: 'nearby',      label: 'Arriving Soon',          lat: 19.0940, lng: 72.8870 },
  { stage: 'delivered',   label: 'Delivered ✓',            lat: 19.0960, lng: 72.8890 },
];

// @desc   Advance delivery tracking stage (called from admin or background sim)
// @route  PUT /api/tracking/:orderId/advance
// @access Admin
const advanceDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const completedStages = order.deliveryTracking?.length || 0;
    if (completedStages >= DELIVERY_STAGES.length) {
      return res.json({ success: true, message: 'Order already fully delivered.', order });
    }

    const nextStage = DELIVERY_STAGES[completedStages];
    order.deliveryTracking.push({
      stage: nextStage.stage,
      label: nextStage.label,
      completedAt: new Date(),
      lat: nextStage.lat + (Math.random() - 0.5) * 0.005,
      lng: nextStage.lng + (Math.random() - 0.5) * 0.005,
    });

    // Sync the main status field
    if (nextStage.stage === 'delivered') order.status = 'delivered';
    else if (['picked-up', 'on-the-way', 'nearby'].includes(nextStage.stage)) order.status = 'shipped';
    else if (['confirmed', 'processing'].includes(nextStage.stage)) order.status = 'processing';

    // Assign a delivery agent if not yet assigned
    if (!order.deliveryAgent?.name) {
      const agents = ['Ravi Kumar', 'Amit Sharma', 'Priya Singh', 'Suresh Patel'];
      order.deliveryAgent = {
        name: agents[Math.floor(Math.random() * agents.length)],
        phone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
        avatar: `https://i.pravatar.cc/80?u=${Math.random()}`,
      };
    }

    await order.save();

    // Emit real-time update to all tracking room subscribers
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${order._id}`).emit('delivery-update', {
        stages: order.deliveryTracking,
        currentStage: nextStage,
        status: order.status,
        deliveryAgent: order.deliveryAgent,
      });
    }

    res.json({ success: true, currentStage: nextStage, order });
  } catch (err) {
    next(err);
  }
};

// @desc   Get current tracking state for an order
// @route  GET /api/tracking/:orderId
// @access Private (order owner or admin)
const getTracking = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const completedCount = order.deliveryTracking?.length || 0;
    const currentStage = DELIVERY_STAGES[Math.max(completedCount - 1, 0)];
    const nextStage = DELIVERY_STAGES[completedCount] || null;

    res.json({
      success: true,
      order,
      stages: DELIVERY_STAGES,
      deliveryTracking: order.deliveryTracking || [],
      currentStage,
      nextStage,
      deliveryAgent: order.deliveryAgent,
      percentComplete: Math.round((completedCount / DELIVERY_STAGES.length) * 100),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { advanceDelivery, getTracking };
