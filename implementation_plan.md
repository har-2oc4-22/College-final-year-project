# MERN Grocery E-Commerce App — Implementation Plan

A full-stack grocery shopping application built with MongoDB, Express.js, React, and Node.js. Includes JWT authentication, product/cart/order management, AI-lite features (recommendations, auto-cart), a rule-based chatbot, and a complete deployment guide.

---

## Proposed Changes

### Backend — `server/`

New Express.js app with clean MVC structure. All routes protected with JWT middleware where needed.

#### [NEW] `server/package.json`
- Dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `dotenv`, `cors`, `express-validator`

#### [NEW] `server/.env.example`
- `PORT`, `MONGO_URI`, `JWT_SECRET`

#### [NEW] `server/server.js`
- Entry point, mounts all routes, global error handler, CORS config

#### [NEW] `server/config/db.js`
- Mongoose connection helper

#### [NEW] `server/middleware/auth.js`
- JWT verification middleware

#### [NEW] `server/middleware/errorHandler.js`
- Centralized error handler

---

#### Models

#### [NEW] `server/models/User.js`
- Fields: `name`, `email`, `password` (hashed), `createdAt`

#### [NEW] `server/models/Product.js`
- Fields: `name`, `category`, `price`, `description`, `image`, `stock`, `rating`

#### [NEW] `server/models/Cart.js`
- Fields: `user` (ref User), `items: [{product, quantity}]`

#### [NEW] `server/models/Order.js`
- Fields: `user`, `items`, `total`, `status`, `createdAt`

---

#### Auth

#### [NEW] `server/controllers/authController.js`
- `register` — hash password, create user, return JWT
- `login` — validate credentials, return JWT

#### [NEW] `server/routes/authRoutes.js`
- `POST /api/auth/register`
- `POST /api/auth/login`

---

#### Products

#### [NEW] `server/controllers/productController.js`
- `getAllProducts` — filter by category/search
- `getProductById`
- `createProduct` (admin-like)
- `updateProduct`
- `deleteProduct`

#### [NEW] `server/routes/productRoutes.js`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

---

#### Cart

#### [NEW] `server/controllers/cartController.js`
- `getCart` — get user's cart
- `addToCart` — add or increment item
- `updateCartItem` — change quantity
- `removeFromCart` — remove item
- `clearCart`

#### [NEW] `server/routes/cartRoutes.js`
- All routes protected with auth middleware
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`

---

#### Orders

#### [NEW] `server/controllers/orderController.js`
- `checkout` — convert cart to order, clear cart
- `getOrders` — user's order history
- `getOrderById`

#### [NEW] `server/routes/orderRoutes.js`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

---

#### Recommendations

#### [NEW] `server/controllers/recommendationController.js`
- Logic: find user's past orders → extract categories → find top products in same categories → sort by order frequency
- Returns top 5 products

#### [NEW] `server/routes/recommendationRoutes.js`
- `GET /api/recommendations`

---

#### Auto-Cart

#### [NEW] `server/controllers/autocartController.js`
- Logic: analyze order history → count item frequencies → return top 5-10 most frequently ordered as suggested cart

#### [NEW] `server/routes/autocartRoutes.js`
- `GET /api/autocart`

---

#### Chatbot

#### [NEW] `server/controllers/chatbotController.js`
- Rule-based keyword matching for intents: `search`, `add_to_cart`, `show_category`, `help`, `greeting`, `checkout`
- Returns JSON `{intent, response, data?}`

#### [NEW] `server/routes/chatbotRoutes.js`
- `POST /api/chatbot`

---

### Frontend — `client/`

React app initialized with Vite + Tailwind CSS. Modern, premium UI with dark-mode-inspired palette.

#### [NEW] `client/` — Vite + React project

#### [NEW] `client/src/api/axios.js`
- Axios instance with `baseURL` and JWT interceptor

#### [NEW] `client/src/context/AuthContext.jsx`
- Login/logout state, token storage

#### [NEW] `client/src/context/CartContext.jsx`
- Cart state synced with backend

#### Pages

#### [NEW] `client/src/pages/Login.jsx`
#### [NEW] `client/src/pages/Signup.jsx`
#### [NEW] `client/src/pages/Products.jsx`
- Product grid with search bar, category filter, recommendation section
#### [NEW] `client/src/pages/Cart.jsx`
- Cart item list, quantities, total
#### [NEW] `client/src/pages/Checkout.jsx`
- Order summary, place order button

#### Components

#### [NEW] `client/src/components/Navbar.jsx`
#### [NEW] `client/src/components/ProductCard.jsx`
#### [NEW] `client/src/components/ChatBot.jsx`
- Floating chat widget with keyword-based responses
#### [NEW] `client/src/components/AutoCart.jsx`
- Displays suggested cart from /api/autocart

#### [NEW] `client/src/App.jsx`
- React Router DOM setup

---

### Deployment Guide

#### [NEW] `DEPLOYMENT.md`
- Step-by-step: MongoDB Atlas → Render (backend) → Vercel (frontend)

---

## Verification Plan

### Automated Tests
No existing test suite. I will seed the DB with sample products on first run and manually verify APIs using the browser + frontend.

### Manual Verification

1. **Start backend**: `cd server && npm run dev` → confirm `Server running on port 5000`
2. **Seed products**: Backend includes a seed script: `node seed.js`
3. **Start frontend**: `cd client && npm run dev` → open `http://localhost:5173`
4. **Auth flow**: Register a new user → Login → confirm JWT is stored
5. **Product listing**: Products page loads with grid + search works
6. **Cart**: Add product → go to Cart page → update quantity → remove item
7. **Checkout**: Place order → confirm order saved
8. **Recommendations**: `/api/recommendations` returns ≤5 products after order history exists
9. **Auto-cart**: `/api/autocart` returns suggested items
10. **Chatbot**: Type "show fruits" in chat widget → confirm filtered response
