import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import SmartCart from './pages/SmartCart';
import AiRecipes from './pages/AiRecipes';
import FlashSales from './pages/FlashSales';
import VisualSearch from './pages/VisualSearch';
import BudgetPlanner from './pages/BudgetPlanner';
import NutritionDashboard from './pages/NutritionDashboard';
import LiveTracking from './pages/LiveTracking';
import Pantry from './pages/Pantry';
import ChatBot from './components/ChatBot';
import VoiceAssistant from './components/VoiceAssistant';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="pt-4">
              <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
                <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                <Route path="/smart-cart" element={<SmartCart />} />
                <Route path="/ai-recipes" element={<PrivateRoute><AiRecipes /></PrivateRoute>} />
                <Route path="/flash-sales" element={<FlashSales />} />
                <Route path="/visual-search" element={<VisualSearch />} />
                <Route path="/budget-planner" element={<PrivateRoute><BudgetPlanner /></PrivateRoute>} />
                <Route path="/nutrition" element={<PrivateRoute><NutritionDashboard /></PrivateRoute>} />
                <Route path="/orders/:orderId/live-tracking" element={<PrivateRoute><LiveTracking /></PrivateRoute>} />
                <Route path="/orders/:id/tracking" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
                <Route path="/pantry" element={<PrivateRoute><Pantry /></PrivateRoute>} />
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              </Routes>
            </main>
            <ChatBot />
            <VoiceAssistant />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#f9fafb' } },
            }}
          />
        </Router>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
