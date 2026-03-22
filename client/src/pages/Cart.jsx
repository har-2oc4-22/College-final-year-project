import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiTag, FiX } from 'react-icons/fi';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateItem, removeItem, cartLoading } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cart.totalAmount || 0;
  const discountAmount = couponData ? couponData.discountAmount : 0;
  const finalTotal = subtotal - discountAmount;

  const calculateEcoScore = () => {
    if (!cart.items || cart.items.length === 0) return 0;
    const total = cart.items.reduce((acc, item) => acc + (item.product?.ecoScore || 0), 0);
    return Math.round(total / cart.items.length);
  };
  const avgEcoScore = calculateEcoScore();

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code');
    setCouponLoading(true);
    try {
      const { data } = await axios.post('/coupons/validate', { code: couponCode, orderTotal: subtotal });
      setCouponData(data.data);
      toast.success(`Coupon applied! You save ₹${data.data.discountAmount} 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponData(null);
    setCouponCode('');
    toast('Coupon removed');
  };

  if (cartLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500 mx-auto" />
    </div>
  );

  if (!cart.items || cart.items.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeInUp">
      <FiShoppingBag size={64} className="mx-auto text-gray-700 mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-8">Add some fresh groceries to get started!</p>
      <button onClick={() => navigate('/products')} className="btn-primary inline-flex items-center gap-2">
        <FiArrowLeft size={18} /> Browse Products
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FiShoppingBag className="text-primary-500" /> Your Cart
        <span className="badge ml-2">{cart.items.length} items</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map(item => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={item._id} className="card p-4 flex gap-4 items-center animate-fadeInUp">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">{product.name}</h3>
                  <span className="badge text-xs mt-0.5">{product.category}</span>
                  <p className="text-primary-400 font-bold mt-1">₹{product.price} <span className="text-gray-500 font-normal text-xs">/{product.unit}</span></p>
                </div>

                {/* Qty control */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    id={`dec-${product._id}`}
                    onClick={() => updateItem(product._id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                  <button
                    id={`inc-${product._id}`}
                    onClick={() => updateItem(product._id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-white font-bold">₹{(product.price * item.quantity).toFixed(0)}</span>
                  <button
                    id={`remove-${product._id}`}
                    onClick={() => removeItem(product._id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit sticky top-24 animate-slideInRight">
          <h2 className="font-bold text-white text-lg mb-4 pb-3 border-b border-gray-800">Order Summary</h2>

          {/* Coupon Input */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2 flex items-center gap-1"><FiTag size={14} /> Coupon Code</p>
            {couponData ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
                <div>
                  <p className="text-green-400 font-semibold text-sm">{couponData.code}</p>
                  <p className="text-green-300 text-xs">-₹{couponData.discountAmount} saved!</p>
                </div>
                <button onClick={removeCoupon} className="text-gray-400 hover:text-white"><FiX size={16} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="input-field text-sm flex-1 py-2"
                  placeholder="Enter code..."
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="btn-primary py-2 px-3 text-sm"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            {couponData && (
              <div className="flex justify-between text-green-400 text-sm">
                <span>Discount ({couponData.code})</span>
                <span>-₹{discountAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Delivery</span>
              <span className="text-primary-400">FREE</span>
            </div>

            {/* Eco Carbon Widget */}
            {avgEcoScore > 0 && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-900/30 to-green-800/10 border border-green-500/30 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-400/30 transition-all duration-500"></div>
                <div className="flex justify-between items-center text-green-400 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="text-xl animate-bounce">🌿</span> Carbon Saved
                  </span>
                  <span className="font-extrabold text-white bg-green-500/20 px-2 py-0.5 rounded-md">
                    ~{(avgEcoScore * 0.12).toFixed(1)} kg
                  </span>
                </div>
                <p className="text-[10px] text-green-500/70 mt-1 uppercase tracking-wider font-bold">Cart Eco-Rating: {avgEcoScore}/100</p>
              </div>
            )}
            
          </div>
          <div className="flex justify-between font-bold text-white text-lg pt-3 border-t border-gray-800 mb-5">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(0)}</span>
          </div>
          <button
            id="checkout-btn"
            onClick={() => navigate('/checkout', { state: { coupon: couponData } })}
            className="btn-primary w-full py-3 text-center"
          >
            Proceed to Checkout →
          </button>
          <button
            onClick={() => navigate('/products')}
            className="btn-secondary w-full py-2.5 mt-3 flex items-center justify-center gap-2 text-sm"
          >
            <FiArrowLeft size={16} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
