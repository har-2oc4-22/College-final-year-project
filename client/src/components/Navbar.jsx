import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiHeart, FiSettings, FiMenu, FiX, FiCamera, FiPackage } from 'react-icons/fi';
import { MdStorefront, MdDashboard } from 'react-icons/md';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/products" className="flex items-center gap-2 group">
            <MdStorefront size={28} className="text-primary-500 group-hover:text-primary-400 transition-colors" />
            <span className="text-xl font-bold text-white tracking-tight">
              Fresh<span className="text-primary-500">Mart</span>
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Admin badge */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    id="admin-link"
                    className="hidden sm:flex items-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 font-medium py-2 px-3 rounded-xl transition-all duration-200 text-sm"
                  >
                    <MdDashboard size={16} /> Admin
                  </Link>
                )}

                {/* AI Smart List */}
                <Link
                  to="/smart-cart"
                  className="hidden sm:flex items-center gap-1.5 bg-primary-900/30 hover:bg-primary-900/50 text-primary-400 font-bold py-2 px-3 rounded-xl border border-primary-500/20 transition-all duration-200 text-sm"
                  title="AI Smart List"
                >
                  <FiCamera size={16} /> <span className="hidden md:block">Smart List</span>
                </Link>

                <Link
                  to="/ai-recipes"
                  className="hidden sm:flex items-center gap-1.5 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 font-bold py-2 px-3 rounded-xl border border-orange-500/20 transition-all duration-200 text-sm"
                  title="AI Recipes"
                >
                  <span className="text-base">🧑‍🍳</span> <span className="hidden xl:block">AI Recipes</span>
                </Link>

                <Link
                  to="/flash-sales"
                  className="hidden sm:flex items-center gap-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold py-2 px-3 rounded-xl border border-red-500/20 transition-all duration-200 text-sm"
                  title="Flash Sales"
                >
                  <span className="text-base">⚡</span> <span className="hidden xl:block">Deals</span>
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  id="wishlist-btn"
                  className="hidden sm:flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-red-400 font-medium py-2 px-3 rounded-xl transition-all duration-200"
                  title="Wishlist"
                >
                  <FiHeart size={17} />
                </Link>

                {/* My Orders */}
                <Link
                  to="/my-orders"
                  className="hidden sm:flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2 px-3 rounded-xl transition-all duration-200"
                  title="My Orders"
                >
                  <FiPackage size={17} />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  id="cart-btn"
                  className="relative flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200"
                >
                  <FiShoppingCart size={18} />
                  <span className="hidden sm:block">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse-glow">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile */}
                <Link
                  to="/profile"
                  id="profile-btn"
                  className="hidden sm:flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2 px-3 rounded-xl transition-all duration-200"
                  title="Profile"
                >
                  <FiUser size={17} />
                  <span className="hidden md:block text-sm max-w-20 truncate">{user.name?.split(' ')[0]}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  id="logout-btn"
                  className="hidden sm:flex items-center gap-1.5 bg-gray-800 hover:bg-red-900/50 text-gray-300 hover:text-red-300 font-medium py-2 px-3 rounded-xl transition-all duration-200"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>

                {/* Mobile menu toggle */}
                <button
                  className="sm:hidden p-2 text-gray-400 hover:text-white"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary flex items-center gap-1.5 py-2 px-4 text-sm">
                  <FiLogIn size={16} /> Login
                </Link>
                <Link to="/signup" className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                  <FiUser size={16} /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && user && (
          <div className="sm:hidden py-4 border-t border-gray-800 flex flex-col gap-2">
            {user.role === 'admin' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-purple-400 bg-purple-500/10">
                <MdDashboard size={18} /> Admin Dashboard
              </Link>
            )}
            <Link to="/smart-cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-primary-400 bg-primary-900/10">
              <FiCamera size={18} /> AI Smart List
            </Link>
            <Link to="/ai-recipes" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-orange-400 bg-orange-900/10">
              <span className="text-lg w-[18px]">🧑‍🍳</span> AI Recipes
            </Link>
            <Link to="/flash-sales" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-red-400 bg-red-900/10">
              <span className="text-lg w-[18px]">⚡</span> Flash Deals
            </Link>
            <Link to="/visual-search" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-purple-400 bg-purple-900/10">
              <span className="text-lg w-[18px]">📸</span> Visual Search
            </Link>
            <Link to="/budget-planner" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-emerald-400 bg-emerald-900/10">
              <span className="text-lg w-[18px]">🧠</span> Budget Planner
            </Link>
            <Link to="/nutrition" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-green-400 bg-green-900/10">
              <span className="text-lg w-[18px]">📊</span> Nutrition
            </Link>
            <Link to="/my-orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-gray-800">
              <FiPackage size={18} /> My Orders
            </Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-gray-800">
              <FiHeart size={18} /> Wishlist
            </Link>
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-gray-800">
              <FiUser size={18} /> Profile
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-900/20 text-left">
              <FiLogOut size={18} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
