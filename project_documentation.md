# 📚 Grow Carry — Complete Project Documentation
*Structured for Interview Preparation & Revision*

---

## 1. Project Overview
- **What it does:** Grow Carry is a full-stack, feature-rich grocery e-commerce application. Users can browse products, manage a smart cart, checkout with multiple payment options (UPI, Cash, Cards), earn loyalty points, track delivery in real-time, and rate products they have purchased.
- **Problem it solves:** Traditional grocery apps lack post-purchase engagement and environmental awareness. Grow Carry introduces a "Digital Pantry" to track goods until they expire (reducing food waste), uses WebSockets for real-time delivery tracking, tracks eco-scores and carbon footprints for environmentally conscious purchasing, and lets users review only products they have genuinely bought and received.
- **Main objective:** To demonstrate advanced full-stack MERN capabilities including real-time bidirectional communication, complex database aggregations, security protocols, PDF generation, admin product lifecycle management, and smooth UI/UX state management.

---

## 2. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React.js (Vite)** | Fast UI rendering, component-based SPA architecture |
| **Tailwind CSS** | Utility-first responsive styling, dark-mode theming |
| **Socket.io-client** | Real-time order tracking & live updates |
| **Recharts** | Analytical charts on the Admin Dashboard |
| **Axios** | Promise-based HTTP requests with JWT interceptor |
| **React Router DOM** | Client-side routing |
| **React Hot Toast** | Non-blocking notification toasts |
| **React Icons** | Feather / icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js & Express.js** | REST API, routing, middleware pipeline |
| **Socket.io** | Bidirectional WebSocket events for live tracking |
| **PDFKit** | Dynamic PDF invoice generation per order |
| **JSON2CSV** | Admin data export (orders, users) to CSV |
| **Nodemailer** | Transactional email (order confirmation) |
| **JWT** | Stateless authentication & route protection |
| **bcryptjs** | Password hashing |
| **Multer / Cloudinary** | Product image upload & cloud hosting |
| **express-rate-limit** | Brute-force attack prevention on auth routes |
| **Helmet / XSS-Clean** | HTTP header hardening & XSS sanitisation |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document store |
| **Mongoose** | Schema validation, population, aggregation pipelines |

---

## 3. Features Implemented

| # | Feature | Description |
|---|---|---|
| 1 | **Authentication & Authorization** | JWT login/signup. Middleware enforces `user` vs `admin` role on every protected route. |
| 2 | **Product Catalog** | Dynamic listing with search, category filter, price range, sort by rating/price, and pagination. |
| 3 | **Eco & Carbon Tracking** | Every product stores `ecoScore`, `ecoImpact`, `carbonFootprint (kg CO₂)`, `origin`, and `isOrganic` flag. Displayed on cards and managed by admin. |
| 4 | **Expiry Date Management** | Admin sets product expiry dates. Admin table shows colour-coded countdown (red = expired, orange = <7 days, green = safe). |
| 5 | **Smart Cart & Loyalty Points** | Cart auto-calculates discounts; checkout earns "FreshPoints" redeemable on future orders. |
| 6 | **Checkout Flow** | COD, UPI QR simulation, and Razorpay SDK integration, with coupon code support. |
| 7 | **Digital Pantry & Expiry Tracker** | Post-checkout, items auto-route to a personal Pantry. Backend calculates shelf life by category (Meat = 5 days, Pantry staples = 180 days). |
| 8 | **My Orders** | Per-order status timeline, invoice PDF download, live tracking link. |
| 9 | **Post-Purchase Reviews** | Users can rate (1–5 ⭐) any product from a **delivered** order. Backend enforces purchase-gate — only buyers of a delivered order may submit a review. After rating, button changes to "✅ Reviewed". |
| 10 | **Real-time Live Tracking** | Admin advancing an order stage emits a Socket.io event; user's progress bar updates instantly without refresh. |
| 11 | **Flash Sales** | Admin can activate time-limited discount on any product with a live sale-price preview; displayed on the product card. |
| 12 | **Nutrition Info** | Admin manages per-product macros (calories, protein, carbs, fat, fiber) shown on the Nutrition Dashboard. |
| 13 | **Admin Dashboard** | Revenue analytics (30-day), order management, user management (role change, delete), product CRUD, CSV exports. |
| 14 | **Admin Product Management** | Full-form modal: basic info, image upload, expiry date, origin, eco/carbon data, nutrition, flash sale toggle with live price preview. |
| 15 | **AI Recommendations** | Past order history → category extraction → top-rated matching products shown on Products page. |
| 16 | **Auto-Cart** | Analyses order frequency → suggests the most-reordered items as a one-click cart fill. |
| 17 | **Budget Planner** | User sets a weekly/monthly budget; AI suggests a basket that maximises nutrition within the budget. |
| 18 | **AI Recipes** | Suggests recipes based on items in the user's cart or pantry using Gemini API. |
| 19 | **Visual Search** | Upload a food photo → Gemini identifies it → instant product search. |
| 20 | **Smart Shopping List** | Natural-language grocery list input converted to structured cart items. |
| 21 | **Chatbot** | Floating rule-based chatbot handles product search, category browsing, cart help, and greetings. |
| 22 | **Wishlist** | Save products for later; one-click add to cart from wishlist. |
| 23 | **Coupons** | Admin creates discount codes; users apply at checkout for percentage/flat reduction. |

---

## 4. System Architecture

```
Client (React) ──Axios──► Express Middleware ──► Controller ──► MongoDB
                              │  [helmet, xss, protect JWT]       │
                              └──Socket.io────────────────────────┘
                                   (real-time delivery events)
```

**Complete Request Flow:**
1. **Client (React):** Makes REST request via `axios` (`POST /api/orders`).
2. **Middleware:** `helmet` / `xss-clean` sanitise the request → `protect` middleware decodes Bearer JWT and attaches `req.user`.
3. **Controller:** Processes business logic (e.g., `orderController` clears cart, calculates points, creates Order document, populates Pantry).
4. **MongoDB:** Schema validation, document save.
5. **WebSocket layer:** For tracking, `io.to(room).emit('delivery-update', payload)` bypasses HTTP and instantly pushes new coordinates to the React client.

---

## 5. Folder Structure

```
/client
 └── src/
      ├── api/           # Axios instance + interceptors
      ├── components/    # Reusable UI (Navbar, ProductCard, ReviewModal, ChatBot…)
      ├── context/       # AuthContext, CartContext, SocketContext
      ├── pages/         # Full page views (AdminProducts, MyOrders, LiveTracking…)
      └── App.jsx        # Route definitions

/server
 ├── controllers/    # Business logic per feature
 ├── middleware/     # Auth, errorHandler, rate-limiter, security
 ├── models/         # Mongoose schemas (User, Product, Order, Pantry, Cart…)
 ├── routes/         # Express Router — maps URLs to controllers
 ├── utils/          # sendEmail, generateInvoice
 └── server.js       # Entry point: DB connect, middleware, routes, Socket.io init
```

---

## 6. Database Schema (Key Models)

### Product
| Field | Type | Notes |
|---|---|---|
| `name`, `description` | String | — |
| `price`, `stock` | Number | — |
| `category` | String (Enum) | Fruits, Vegetables, Dairy… |
| `image` | String | Cloudinary URL |
| `ecoScore` | Number 0–100 | Environmental score |
| `ecoImpact` | String (Enum) | High Carbon / Eco-Friendly / Planet Hero… |
| `carbonFootprint` | Number | kg CO₂ per unit |
| `origin` | String | Country / region |
| `isOrganic` | Boolean | Certified organic flag |
| `expiryDate` | Date | Product best-before date |
| `nutritionInfo` | Object | calories, protein, carbs, fat, fiber |
| `flashSale` | Object | active, discountPercent, salePrice, expiresAt |
| `reviews[]` | Array | user ref, name, rating, comment, createdAt |
| `rating`, `numReviews` | Number | Computed average |

### Order
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | — |
| `items[]` | Array | product ref, name, image, price, quantity |
| `totalAmount` | Number | — |
| `status` | Enum | pending → processing → shipped → delivered → cancelled |
| `paymentMethod` | Enum | COD / Razorpay / UPI |
| `deliveryTracking[]` | Array | stage, label, completedAt, lat, lng |
| `pointsUsed`, `pointsEarned` | Number | Loyalty system |

### User
| Field | Type |
|---|---|
| `name`, `email`, `password` (hashed) | String |
| `role` | Enum: user / admin |
| `freshPoints` | Number |

---

## 7. API Endpoints (Highlights)

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Products
| Method | Route | Access |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| GET | `/api/products/:id/reviews` | Public |
| POST | `/api/products/:id/reviews` | Auth (delivered buyer only) |

### Admin — Products
| Method | Route | Access |
|---|---|---|
| GET | `/api/admin/products` | Admin |
| POST | `/api/admin/products` | Admin |
| PUT | `/api/admin/products/:id` | Admin |
| DELETE | `/api/admin/products/:id` | Admin |

### Admin — Orders & Users
| Method | Route | Access |
|---|---|---|
| GET | `/api/admin/stats` | Admin |
| GET / PUT | `/api/admin/orders`, `/api/admin/orders/:id/status` | Admin |
| GET / PUT / DELETE | `/api/admin/users`, `/api/admin/users/:id` | Admin |
| GET | `/api/admin/orders/export`, `/api/admin/users/export` | Admin |

### Orders & Tracking
| Method | Route | Access |
|---|---|---|
| POST | `/api/orders` | Auth |
| GET | `/api/orders` | Auth |
| GET | `/api/orders/:id` | Auth |
| GET | `/api/orders/:id/invoice` | Auth — returns PDF buffer |
| PUT | `/api/tracking/:orderId/advance` | Admin — emits Socket.io |

---

## 8. Key Functionalities Deep Dive

### Auth Structure
`bcrypt.js` hashes passwords on save. On login a JWT signed with `JWT_SECRET` is returned. Frontend stores it in `localStorage` and injects it into every Axios header via a request interceptor.

### Admin Product Management
The `GET /api/admin/products` endpoint (admin-only, paginated, searchable) returns the **full product document** including eco, carbon, nutrition, and flash sale data. The admin form UI is divided into labelled sections (Basic Info / Eco & Carbon / Expiry & Origin / Nutrition / Flash Sale) for clarity. The eco score uses a range slider and the flash sale section shows a live sale price preview as the admin types.

### Purchase-Gated Reviews
`reviewController.js` imports the `Order` model and runs:
```js
Order.findOne({ user: req.user._id, status: 'delivered', 'items.product': product._id })
```
If no matching delivered order is found, the request is rejected with HTTP 403 before the review is written.

### Digital Pantry Auto-Assignment
Inside the `checkout` logic, `Promise.all` iterates over every ordered item. Based on the product `category`, a shelf-life duration is calculated and a Pantry document entry is created automatically — no extra user action required.

### Live Tracking WebSockets
User opens `/live-tracking/:id` → React mounts → `socket.emit('track-order', { orderId })` → server calls `socket.join(room)`. Admin triggers `advanceDelivery` → server runs `io.to(room).emit('delivery-update', payload)` → React instantly updates the animated progress bar.

---

## 9. Challenges and Solutions

| Challenge | Solution |
|---|---|
| Admin UI not updating order status without page reload | Extracted the updated doc from `axios.put` response and called `setOrders(prev => prev.map(...))` for seamless in-place update |
| Brute-force on auth endpoint | `express-rate-limit` with env-based config: 200 req/15min in dev, 10 req/15min in production |
| Preventing fake product reviews | `reviewController` cross-checks the user's order history for a `delivered` order containing the product before accepting any review — HTTP 403 otherwise |
| Admin product form complexity with many fields | Organized into collapsible sections (Basic / Eco / Nutrition / Flash Sale) with a sticky modal header for easy navigation |
| Product image management | Multer + Cloudinary upload on the server; admin can upload a file or paste a URL directly |

---

## 10. Future Improvements
- **Automated Cron Jobs:** `node-cron` emails users 24 h before a pantry item expires.
- **Neighbourhood Group Buying:** Users in the same pin-code pool orders to unlock wholesale discounts.
- **Full Razorpay Webhook:** Replace simulated responses with async webhook validation.
- **Automated Test Suite:** Jest + Supertest for API endpoints; React Testing Library for components.
- **Review Moderation:** Admin can view all reviews and delete inappropriate ones from the product management panel.

---

## 11. How to Run the Project

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure environment
cp server/.env.example server/.env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, GEMINI_API_KEY

# 3. (Optional) Seed sample products
cd server && node seederItems.js

# 4. Start development servers
cd server && npm run dev      # → http://localhost:5000
cd client && npm run dev      # → http://localhost:5173
```

---

## 12. Summary (Interview Pitch)

> *"Grow Carry is a production-grade MERN e-commerce platform engineered to go beyond standard CRUD. On the backend, I built a secure JWT-authenticated REST API with Socket.io for real-time order tracking, PDFKit for automated invoice generation, and MongoDB aggregation pipelines for 30-day revenue analytics on the admin dashboard.*
>
> *A standout feature is the admin product lifecycle system: admins manage every product attribute — expiry dates, carbon footprint, eco score, nutrition info, and flash sales — through a structured form, and the product table displays colour-coded expiry countdowns. For post-purchase engagement, users can rate products directly from their 'My Orders' page, but only after the order is delivered — enforced by a server-side check against the order history, preventing fake reviews.*
>
> *I also engineered a 'Digital Pantry' that hooks into the checkout flow to automatically calculate product shelf-life by category, helping users reduce food waste. The frontend uses React with Tailwind CSS and Context API for cart and auth state, with Axios interceptors injecting JWTs automatically on every request."*

**LinkedIn One-Liner:**
> Grow Carry | Full-Stack MERN Grocery Platform — Built real-time delivery tracking (Socket.io), an admin product lifecycle manager (expiry, carbon, eco, nutrition), post-purchase review enforcement, PDF invoices, and a Digital Pantry auto-assignment system. Deployed on Render + Vercel + MongoDB Atlas.
