import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const updateCartItem = (productId, data) => API.put(`/cart/${productId}`, data);
export const removeFromCart = (productId) => API.delete(`/cart/${productId}`);
export const clearCart = () => API.delete('/cart/clear');

// Orders
export const checkout = (data) => API.post('/orders', data);
export const getOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const downloadInvoice = (id) => API.get(`/orders/${id}/invoice`, { responseType: 'blob' });

// Recommendations
export const getRecommendations = () => API.get('/recommendations');

// Auto-cart
export const getAutoCart = () => API.get('/autocart');

// Smart Cart (AI)
export const parseSmartCart = (data) => API.post('/smart-cart/parse', data);

// Flash Sales
export const getActiveFlashSales = () => API.get('/flash-sale/active');
export const launchFlashSale = (id, data) => API.post(`/flash-sale/${id}/launch`, data);
export const cancelFlashSale = (id) => API.delete(`/flash-sale/${id}/cancel`);

// Visual Search
export const visualSearch = (imageBase64) => API.post('/visual-search', { imageBase64 });

// Budget Planner
export const optimizeBudget = (data) => API.post('/budget-planner/optimize', data);

// Nutrition
export const getNutritionDashboard = () => API.get('/nutrition/dashboard');
export const generateRecipe = (query) => API.post('/recipes/generate', { query });

// Chatbot
export const sendChatMessage = (message) => API.post('/chatbot', { message });

export default API;
