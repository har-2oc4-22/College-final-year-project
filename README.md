# 🛒 FreshMart - NextGen MERN Grocery App

![FreshMart Banner](https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop)

A modern, full-stack grocery e-commerce platform built with the MERN stack. FreshMart goes beyond traditional shopping by integrating smart features like real-time delivery tracking, digital pantry expiry tracking, loyalty rewards (FreshPoints), and eco-score monitoring.

## 🚀 Key Features

- **🛍️ Smart Shopping Cart:** Real-time totals, coupon applications, and FreshPoint loyalty redemption.
- **📡 Live Order Tracking:** Real-time WebSocket-powered delivery tracking moving through 6 stages from restaurant to user.
- **🥫 Digital Pantry Tracker:** Automatically adds purchased items to a digital pantry and tracks their expiry dates based on product categories.
- **💳 Multiple Payment Methods:** Cash on Delivery, Simulated UPI flow with QR generations, and Cards/Netbanking via Razorpay.
- **📊 Admin Dashboard:** Comprehensive stats, Recharts-powered analytics for 30-day revenue/orders, and CSV exports.
- **🤖 Support Chat & Chatbot:** Integrated rule-based chatbot and real-time support channels for users.
- **📧 Automated Emails & Invoices:** Nodemailer order confirmations and PDFKit generated downloadable invoices.

## 🛠️ Tech Stack

**Frontend:** React (Vite), React Router Dom, Tailwind CSS, Recharts, Socket.io-client, React Hot Toast
**Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, PDFKit, JSON2CSV
**Other:** Razorpay SDK (Payments), Nodemailer (Emails), Express-Rate-Limit (Security)

## 📁 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/har-2oc4-22/College-final-year-project.git
   cd College-final-year-project
   ```

2. **Setup Environment Variables:**
   Under `/server`, check the `.env.example` file and create a `.env` file with your MongoDB URI, JWT Secret, and port details.

3. **Install Dependencies:**
   ```bash
   # Install Backend Dependencies
   cd server
   npm install

   # Install Frontend Dependencies
   cd ../client
   npm install
   ```

4. **Run the Application Locally (Two Terminals):**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   # Runs on http://localhost:5000

   # Terminal 2 - Frontend
   cd client
   npm run dev
   # Runs on http://localhost:5173
   ```

## 🔒 Environment Variables Reference (Server)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

## 💡 About Building

FreshMart was built specifically for modern grocery needs, showcasing state-of-the-art architectures using WebSockets for real-time interactivity, Aggregation Pipelines for deep analytics, and JWT token-based authentication for robust security.

---
*Developed by Harsh*
