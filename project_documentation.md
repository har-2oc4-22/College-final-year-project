# 📚 FreshMart - Complete Project Documentation
*Structured for Interview Preparation & Revision*

---

## 1. Project Overview
- **What it does:** FreshMart is a full-stack, feature-rich grocery e-commerce application. Users can browse products, manage a smart cart, checkout with multiple payment options (UPI, Cash, Cards), earn loyalty points, and track their delivery in real-time.
- **Problem it solves:** Traditional grocery apps lack post-purchase engagement. FreshMart introduces a "Digital Pantry" to track goods until they expire to reduce food waste, uses WebSockets to map real-time delivery progress, and tracks Eco-Scores for environmentally conscious purchasing.
- **Main objective:** To demonstrate advanced full-stack MERN capabilities including real-time bidirectional communication, complex database aggregations, security protocols, PDF generation, and smooth UI/UX state management.

---

## 2. Tech Stack
### **Frontend**
- **React.js (via Vite):** Fast UI rendering and component-based architecture.
- **Tailwind CSS:** Utility-first styling for highly responsive, modern UI components.
- **Socket.io-client:** Real-time listening for Chat and Live Order Tracking.
- **Recharts:** Drawing beautiful analytical charts on the Admin Dashboard.
- **Axios:** Handling all promise-based HTTP requests to the backend API.

### **Backend**
- **Node.js & Express.js:** Robust routing, middleware, and backend logic.
- **Socket.io:** Emitting real-time delivery coordinate updates and chat messages.
- **PDFKit & JSON2CSV:** Dynamically generating user invoices (PDF) and admin reports (CSV).
- **Nodemailer:** Sending transactional emails (e.g., Order Confirmation).
- **JWT (JSON Web Tokens):** Securing routes and handling stateless user authentication.

### **Database**
- **MongoDB & Mongoose:** NoSQL document database, utilizing deep population and aggregation pipelines.

---

## 3. Features Implemented

1. **Authentication & Authorization:** Secure Login/Signup with JWT. Middleware verifies normal users vs. Admins to protect routes.
2. **Product & Cart Management:** Dynamic catalog with filtering, eco-scores, and a cart that automatically calculates discounts and 'FreshPoints' (loyalty).
3. **Checkout flow:** Seamless transition from cart to payment step. Supports simulating UPI QR payments, Razorpay SDK integration, and Cash on Delivery.
4. **Digital Pantry & Expiry Tracker:** Post-checkout, purchased items auto-route to a Pantry. Backend algorithms calculate expiry dates depending on the product category (Meat = 5 days, Pantry = 180 days).
5. **Real-time Live Tracking:** An admin pushing an order to the next stage immediately emits a Socket.io event that fills the user's progress bar in real-time.
6. **Admin Dashboard:** Admins can manage Products, Users, and Orders statuses. Provides rich 30-Day automated revenue analytics via MongoDB `$group` pipelines.

---

## 4. System Architecture
**Complete Flow (Frontend → Backend → Database):**
1. **Client (React):** Makes a REST API request via `axios` (e.g., `POST /api/orders` to checkout).
2. **Middleware (Express context):** 
   - `helmet` / `xss` verify request safety.
   - `protect` middleware reads the Bearer token, decodes it, and attaches `req.user`.
3. **Controller:** The `orderController` processes the cart, decreases point balances, creates an Order document, and populates the User's `Pantry` document.
4. **Database (MongoDB):** Applies schema validation and saves documents to collections.
5. **Real-Time Layer (WebSockets):** For tracking, the Admin route updates MongoDB and simultaneously calls `io.emit()` which bypasses standard HTTP, instantly sending new location nodes directly to the connected React client.

---

## 5. Folder Structure Explanation
```text
/client
 ├── src/
 │    ├── api/          # Axios interceptors config
 │    ├── components/   # Reusable UI parts (Navbar, ProductCard, etc.)
 │    ├── context/      # React Contexts (AuthContext, CartContext, Socket)
 │    ├── pages/        # Full page views (Checkout, LiveTracking, AdminDashboard)
 │    └── App.jsx       # Route definitions

/server
 ├── controllers/    # Core business logic for each route
 ├── middleware/     # Security, Auth, Error handlers, and Rate Limiters
 ├── models/         # Mongoose Schemas (User, Product, Order, Pantry)
 ├── routes/         # Express Router endpoints mapping to controller functions
 ├── utils/          # Helpers like SendEmail, ErrorResponse
 └── server.js       # Main backend entry point, connects DB, initializes Sockets
```

---

## 6. Database Schema
- **User Models:** Contains `name`, `email`, `password` (hashed), `role` (user/admin), and `freshPoints`.
- **Product Model:** Contains `name`, `price`, `category`, `stock`, `ecoScore`, `brand`.
- **Order Model:** Stores user references, cart snapshot (`items`), `totalAmount`, `status` (Enum: pending, processing, shipped, delivered), and `deliveryTracking` (an array storing the history of GPS coordinates & timestamps).
- **Pantry Model:** Associates a User ID to a list of products with calculated `purchaseDate` and `expiryDate`.

---

## 7. API Endpoints (Highlights)
- `POST /api/auth/login` → Authenticates user, returns JWT.
- `GET /api/products` → Fetches the grocery catalog.
- `POST /api/orders` → Submits cart, creates order, calculates points, populates Pantry.
- `GET /api/tracking/:orderId` → Fetches current shipping metadata.
- `PUT /api/tracking/:orderId/advance` *(Admin)* → Pushes tracking array, emits to WebSockets.
- `GET /api/admin/stats` *(Admin)* → Uses MongoDB aggregate to gather 30-day graphs.
- `GET /api/orders/:id/invoice` → Generates and returns a downloadable PDF buffer.

---

## 8. Key Functionalities Deep Dive
**Auth Structure:** 
We use `bcrypt.js` to hash passwords upon save. During login, a token is signed with `JWT_SECRET`. The frontend stores this token in `localStorage` and injects it into every Axios header.

**Digital Pantry Auto-Assignment:**
Inside the `checkout` logic, we `Promise.all` over every ordered item. Relying on the `category` of the populated product (e.g., 'Dairy'), it calculates dynamic shelf life days, generating a timestamp pushed into the `Pantry` schema without requiring any extra user action.

**Live Tracking WebSockets:**
When a user opens `/live-tracking/:id`, React mounts and calls `socket.emit('track-order', { orderId })`. The server executes `socket.join(room)`. Now, whenever the admin triggers `advanceDelivery`, the server runs `io.to(room).emit('delivery-update', payload)`. React instantly updates its state, rendering a beautiful moving progress bar.

---

## 9. Challenges and Solutions

1. **Challenge:** Admin tracking status state synchronization. When an Admin advanced an order stage via the API, the backend updated perfectly, but the Admin UI didn't show the new status without a raw `window.location.reload()`.
   **Solution:** Extracted the returned backend schema from the `axios.put` request and directly mutated the React `setOrders(prev => prev.map(...))` state block to make UI updates totally seamless.

2. **Challenge:** Protecting the API endpoints from brute-force login attacks while testing locally.
   **Solution:** Implemented `express-rate-limit`. Created a dynamic env-checker that allows 200 requests/15min in `development` so testing flows seamlessly, but automatically restricts it to 10 requests/15min on production deployment.

---

## 10. Future Improvements
- **Automated Cron Jobs:** Use `node-cron` to automatically email users a day before a specific Digital Pantry item expires to reduce waste.
- **Neighborhood Group Buying:** Implement a feature where users in the same zip code can group their orders under a single delivery threshold to unlock wholesale discounts.
- **Payment Gateway:** Remove simulated responses and wrap a full webhook handler over the Razorpay integration to catch async payment failures securely.

---

## 11. How to Run the Project
1. Run `npm install` in both `/client` and `/server`.
2. Add a `.env` in the server root with `MONGO_URI` and `JWT_SECRET`.
3. Open Terminal 1: run `npm run dev` inside `/server` (Listens on port 5000).
4. Open Terminal 2: run `npm run dev` inside `/client` (Listens on port 5173).
5. Load `http://localhost:5173` in your browser.

---

## 12. Summary (Interview Pitch)
> "FreshMart is a full-stack MERN e-commerce application I engineered to go beyond standard CRUD applications by focusing on post-checkout logistics and user retention. I architected a system utilizing MongoDB aggregations for analytics, built a real-time order tracking suite powered by Socket.io, and engineered a 'digital pantry' feature that actively hooks into the checkout flow to calculate product shelf life. The backend leverages strict JWT-based middleware, while the frontend handles dynamic cart state management and real-time UI progression rendering via Tailwind."
