# Grow Carry — Implementation Plan (Current State)

A production-grade full-stack grocery e-commerce app built with MongoDB, Express.js, React (Vite), and Node.js. Features JWT auth, real-time tracking, admin product lifecycle management, post-purchase reviews, AI-powered features, and full deployment on Render + Vercel + MongoDB Atlas.

---

## Backend — `server/`

Clean MVC structure. All state-mutating routes are protected with JWT middleware; admin routes additionally require `adminOnly`.

---

### Infrastructure

| File | Role |
|---|---|
| `server.js` | Entry point — DB connect, middleware stack, all route mounts, Socket.io init |
| `config/db.js` | Mongoose connection helper |
| `middleware/auth.js` | `protect` (JWT verify) + `adminOnly` (role gate) |
| `middleware/errorHandler.js` | Centralised error formatting |
| `.env` | `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `GEMINI_API_KEY` |

---

### Models

#### `models/User.js`
- `name`, `email`, `password` (bcrypt hashed), `role` (user/admin), `freshPoints`

#### `models/Product.js`
- **Basic:** `name`, `description`, `price`, `stock`, `unit`, `category`, `image`
- **Eco & Carbon:** `ecoScore` (0–100), `ecoImpact` (Enum), `carbonFootprint` (kg CO₂), `isOrganic` (Boolean), `origin` (String)
- **Dates:** `expiryDate` (Date)
- **Nutrition:** `nutritionInfo { calories, protein, carbs, fat, fiber }`
- **Flash Sale:** `flashSale { active, discountPercent, salePrice, expiresAt }`
- **Reviews:** `reviews[]` → `{ user ref, name, rating 1–5, comment, createdAt }`, `rating` (avg), `numReviews`

#### `models/Order.js`
- `user` ref, `items[]` (product ref, name, image, price, qty), `totalAmount`, `status` (Enum), `paymentMethod`, `isPaid`, `deliveryTracking[]`, `pointsUsed`, `pointsEarned`

#### `models/Cart.js`, `models/Pantry.js`, `models/Coupon.js`, `models/Wishlist.js`
- Supporting models for respective features

---

### Controllers & Routes

#### Auth
- `POST /api/auth/register` — hash pw, create user, return JWT
- `POST /api/auth/login` — validate, return JWT

#### Products (Public)
- `GET /api/products` — search, category filter, price range, sort, pagination
- `GET /api/products/:id` — single product detail
- `POST /api/products/:id/reviews` *(Auth + delivered-buyer check)* — add review
- `GET /api/products/:id/reviews` — read reviews
- `DELETE /api/products/:id/reviews/:reviewId` *(Auth, own or admin)*

#### Admin — Products *(Admin only)*
- `GET /api/admin/products` — paginated, searchable full product list
- `POST /api/admin/products` — create product (all fields)
- `PUT /api/admin/products/:id` — update any product field
- `DELETE /api/admin/products/:id` — delete product

#### Admin — Orders *(Admin only)*
- `GET /api/admin/orders` — all orders with pagination + status filter
- `PUT /api/admin/orders/:id/status` — update status (triggers Socket.io)
- `GET /api/admin/orders/export` — CSV download

#### Admin — Users *(Admin only)*
- `GET /api/admin/users` — all users
- `PUT /api/admin/users/:id/role` — promote/demote
- `DELETE /api/admin/users/:id`
- `GET /api/admin/users/export` — CSV download

#### Admin — Dashboard
- `GET /api/admin/stats` — totals + 30-day revenue via MongoDB `$group` aggregation

#### Orders *(Auth)*
- `POST /api/orders` — checkout: clear cart, create order, earn points, populate pantry
- `GET /api/orders` — user's order history
- `GET /api/orders/:id/invoice` — generate & return PDF (PDFKit)

#### Tracking
- `GET /api/tracking/:orderId`
- `PUT /api/tracking/:orderId/advance` *(Admin)* — advance stage + `io.to(room).emit()`

#### Cart, Pantry, Wishlist, Coupons
- Standard CRUD behind `protect` middleware

#### AI Features
- `GET /api/recommendations` — order-history-based product recommendations
- `GET /api/autocart` — order-frequency-based cart suggestions
- `POST /api/chatbot` — rule-based intent matching
- `POST /api/visual-search` — Gemini image recognition
- `POST /api/recipes` — Gemini recipe suggestions from pantry/cart
- `POST /api/budget-planner` — nutrition-optimised basket within budget
- `POST /api/smart-list` — NL grocery list → structured cart items

#### Upload
- `POST /api/upload` — Multer + Cloudinary image upload, returns public URL

---

## Frontend — `client/src/`

React + Vite + Tailwind CSS. Dark-mode premium UI.

### State Management
- `AuthContext` — JWT, user object, login/logout
- `CartContext` — cart items, quantities, totals, synced with backend

### Pages

| Page | Key Behaviour |
|---|---|
| `Products.jsx` | Grid + sidebar filters + recommendations + pagination |
| `Cart.jsx` | Item management, coupon input, points redemption |
| `Checkout.jsx` | Address, payment method (COD / UPI QR / Razorpay), order place |
| `MyOrders.jsx` | Status timeline per order. **Delivered orders** show ⭐ Rate button per item → opens ReviewModal. Reviewed items show ✅ badge. |
| `LiveTracking.jsx` | Socket.io live progress bar |
| `AdminDashboard.jsx` | Revenue charts (Recharts), KPI cards |
| `AdminProducts.jsx` | Full CRUD with rich modal form: Basic / Image / Expiry & Origin / Eco & Carbon / Nutrition / Flash Sale sections. Eco score range slider, organic toggle, flash sale live price preview. Table shows expiry countdown (colour-coded), carbon kg, eco badge. |
| `AdminOrders.jsx` | Status management, approve/advance orders |
| `AdminUsers.jsx` | Role toggle, delete user |
| `Pantry.jsx` | Post-purchase item tracker with expiry alerts |
| `Wishlist.jsx` | Saved items, add-to-cart shortcut |
| `NutritionDashboard.jsx` | Macro breakdown of cart/pantry |
| `BudgetPlanner.jsx` | AI budget basket |
| `AiRecipes.jsx` | Gemini recipe suggestions |
| `VisualSearch.jsx` | Image upload → product identification |
| `SmartCart.jsx` | NL shopping list input |
| `FlashSales.jsx` | Active flash sale products |

### Components

| Component | Purpose |
|---|---|
| `Navbar.jsx` | Top nav with cart badge, auth links |
| `ProductCard.jsx` | Product tile with eco badge, flash sale chip, add-to-cart |
| `ReviewModal.jsx` | **New** — 5-star interactive rating + comment, submits to `/api/products/:id/reviews`. Shows product preview card. |
| `AutoCart.jsx` | Suggested reorder items banner |
| `ChatBot.jsx` | Floating chat widget |

---

## Security

- **JWT** on all state-changing routes; `adminOnly` on all `/api/admin/*` routes
- **bcryptjs** password hashing
- **express-rate-limit** — 10 req/15min (prod), 200 req/15min (dev)
- **Helmet** HTTP headers
- **XSS-Clean** input sanitisation
- **Purchase-gated reviews** — server verifies delivered order before accepting review (HTTP 403 otherwise)

---

## Deployment

| Layer | Platform |
|---|---|
| Database | MongoDB Atlas |
| Backend | Render (Node.js web service) |
| Frontend | Vercel (Vite static build) |

```bash
# Local dev
cd server && npm run dev      # port 5000
cd client && npm run dev      # port 5173

# Seed data
cd server && node seederItems.js
```

---

## Verification Checklist

| # | Test |
|---|---|
| 1 | Register → Login → JWT stored in localStorage |
| 2 | Products page loads with grid, search, filters, pagination |
| 3 | Add to cart → update qty → remove → clear |
| 4 | Checkout (COD) → order created → pantry auto-populated |
| 5 | Admin: Create product with all fields (expiry, carbon, eco, nutrition, flash sale) |
| 6 | Admin: Edit product → values pre-fill → update persists |
| 7 | Admin: Delete product → removed from listing |
| 8 | Admin: Advance order status → user's live tracking updates via Socket.io |
| 9 | User: Open delivered order → expand items → click ⭐ Rate → modal opens |
| 10 | Submit review → toast success → button → "✅ Reviewed" |
| 11 | Attempt review on non-delivered order → blocked (no button shown) |
| 12 | Attempt duplicate review → server returns 400 |
| 13 | Non-buyer attempt review via API → server returns 403 |
| 14 | Invoice PDF download from My Orders |
| 15 | CSV export from Admin Orders / Users |
| 16 | Visual search → product identified |
| 17 | Budget planner → basket within budget returned |
