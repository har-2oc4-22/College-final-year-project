const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  exportOrdersCSV,
  exportUsersCSV,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);

router.get('/orders', getAllOrders);
router.get('/orders/export', exportOrdersCSV);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/users', getAllUsers);
router.get('/users/export', exportUsersCSV);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
