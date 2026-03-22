const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Setup ────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store active chat rooms: { roomId: [{ id, name, role, messages[] }] }
const chatRooms = {};

io.on('connection', (socket) => {
  // ── Delivery Tracking ──────────────────────────────────────────
  socket.on('track-order', ({ orderId }) => {
    socket.join(`order-${orderId}`);
  });

  // ── Support Chat ──────────────────────────────────────────────
  socket.on('join-chat', ({ orderId, userName, role }) => {
    const room = `chat-${orderId}`;
    socket.join(room);
    if (!chatRooms[room]) chatRooms[room] = [];

    const welcomeMsg = {
      id: Date.now(),
      sender: 'System',
      role: 'system',
      text: role === 'admin'
        ? `Support agent ${userName} has joined.`
        : `${userName} connected. Support will be with you shortly!`,
      time: new Date().toISOString(),
    };
    chatRooms[room].push(welcomeMsg);
    io.to(room).emit('chat-history', chatRooms[room]);
    io.to(room).emit('new-message', welcomeMsg);
  });

  socket.on('send-message', ({ orderId, sender, role, text }) => {
    const room = `chat-${orderId}`;
    const msg = { id: Date.now(), sender, role, text, time: new Date().toISOString() };
    if (!chatRooms[room]) chatRooms[room] = [];
    chatRooms[room].push(msg);
    io.to(room).emit('new-message', msg);
  });

  socket.on('disconnect', () => {});
});

// Expose io to controllers
app.set('io', io);

// ─── Security Middleware ───────────────────────────────────────────────────────
// Set secure HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Sanitize data (prevent NoSQL injection)
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// General API rate limiter
app.use('/api', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
// Auth routes with stricter rate limiter
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/autocart', require('./routes/autocartRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/pantry', require('./routes/pantryRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/smart-cart', require('./routes/smartListRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/flash-sale', require('./routes/flashSaleRoutes'));
app.use('/api/visual-search', require('./routes/visualSearchRoutes'));
app.use('/api/budget-planner', require('./routes/budgetPlannerRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Grocery API is running 🛒', status: 'OK', version: '2.0' });
});

// Global error handler
app.use(errorHandler);
// Trigger restart for API key load 5

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
