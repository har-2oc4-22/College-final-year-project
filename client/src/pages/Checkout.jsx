import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkout } from '../api/axios';
import axios from '../api/axios';
import { FiMapPin, FiCreditCard, FiCheck, FiTag, FiShoppingBag, FiStar, FiSmartphone, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, emptyCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const coupon = location.state?.coupon || null;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [address, setAddress] = useState({
    street: '', city: '', state: '', postalCode: '', country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiTxnId, setUpiTxnId] = useState('');

  const subtotal = cart.totalAmount || 0;
  const discount = coupon ? coupon.discountAmount : 0;
  let finalTotal = subtotal - discount;

  const pointsAvailable = user?.freshPoints || 0;
  const pointsToUse = usePoints ? Math.min(pointsAvailable, finalTotal) : 0;
  finalTotal -= pointsToUse;

  const calculateEcoScore = () => {
    if (!cart.items || cart.items.length === 0) return 0;
    const total = cart.items.reduce((acc, item) => acc + (item.product?.ecoScore || 0), 0);
    return Math.round(total / cart.items.length);
  };
  const avgEcoScore = calculateEcoScore();

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    
    // Open UPI Modal if selected
    if (paymentMethod === 'UPI') {
      setShowUpiModal(true);
      return;
    }

    await processCheckout();
  };

  const processCheckout = async (simulatedUpiId = null) => {
    setLoading(true);
    try {
      const payload = { 
        shippingAddress: address, 
        paymentMethod, 
        pointsUsed: pointsToUse,
        ...(simulatedUpiId && { upiTransactionId: simulatedUpiId })
      };
      
      const orderRes = await checkout(payload);
      const orderId = orderRes.data.order._id;

      if (paymentMethod === 'Razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) throw new Error('Razorpay SDK failed to load. Are you online?');

        const payReq = await axios.post(`/orders/${orderId}/pay`);
        const { id, amount, currency } = payReq.data.data;
        const keyId = payReq.data.keyId;

        const options = {
          key: keyId,
          amount,
          currency,
          name: 'FreshMart',
          description: 'Grocery Purchase',
          order_id: id,
          handler: async function (response) {
            try {
              toast.loading('Verifying payment...', { id: 'verify' });
              await axios.post(`/orders/${orderId}/verify-payment`, response);
              toast.success('Payment successful!', { id: 'verify' });
              await emptyCart();
              setSuccess(true);
            } catch (err) {
              toast.error('Payment verification failed', { id: 'verify' });
            }
          },
          theme: { color: '#22c55e' },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          toast.error('Payment failed');
          setLoading(false);
        });
        rzp.open();
      } else {
        await emptyCart();
        setSuccess(true);
        setShowUpiModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  const handleUpiSubmit = (e) => {
    e.preventDefault();
    if (upiTxnId.length < 12) {
      toast.error('Please enter a valid 12-digit Transaction ID');
      return;
    }
    processCheckout(upiTxnId);
  };

  if (success) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center animate-fadeInUp">
      <div className="w-20 h-20 bg-primary-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary-500">
        <FiCheck size={36} className="text-primary-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Order Placed! 🎉</h2>
      <p className="text-gray-400 mb-8">Your order has been received and will be delivered soon.</p>
      <button onClick={() => navigate('/products')} className="btn-primary px-8 py-3">
        Continue Shopping
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FiCreditCard className="text-primary-500" /> Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping form */}
        <form onSubmit={handleOrder} className="lg:col-span-2">
          <div className="card p-6 animate-fadeInUp">
            <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary-500" /> Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">Street Address</label>
                <input
                  id="addr-street"
                  type="text"
                  className="input"
                  placeholder="123 Main Street, Apt 4B"
                  value={address.street}
                  onChange={e => setAddress({ ...address, street: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">City</label>
                <input
                  id="addr-city"
                  type="text"
                  className="input"
                  placeholder="Mumbai"
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">State</label>
                <input
                  id="addr-state"
                  type="text"
                  className="input"
                  placeholder="Maharashtra"
                  value={address.state}
                  onChange={e => setAddress({ ...address, state: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Postal Code</label>
                <input
                  id="addr-postal"
                  type="text"
                  className="input"
                  placeholder="400001"
                  value={address.postalCode}
                  onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Country</label>
                <input type="text" className="input" value="India" readOnly />
              </div>
            </div>

            {/* Loyalty Points */}
            {pointsAvailable > 0 && (
              <>
                <h2 className="font-bold text-white text-lg mb-4 mt-8 flex items-center gap-2">
                  <FiStar className="text-yellow-500" /> Apply FreshPoints
                </h2>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900">
                  <div>
                    <p className="text-white font-medium">Use my {pointsAvailable} points</p>
                    <p className="text-gray-400 text-sm">Save up to ₹{Math.min(pointsAvailable, subtotal - discount)} on this order</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={() => setUsePoints(!usePoints)} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </>
            )}

            {/* Payment Method Selector */}
            <h2 className="font-bold text-white text-lg mb-4 mt-8 flex items-center gap-2">
              <FiCreditCard className="text-primary-500" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  paymentMethod === 'COD' ? 'border-primary-500 bg-primary-900/10 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                }`}
                onClick={() => setPaymentMethod('COD')}
              >
                <input type="radio" className="hidden" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => {}} />
                <FiCheck size={18} className={paymentMethod === 'COD' ? 'text-primary-500' : 'text-gray-600'} />
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <div
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  paymentMethod === 'Razorpay' ? 'border-primary-500 bg-primary-900/10 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                }`}
                onClick={() => setPaymentMethod('Razorpay')}
              >
                <input type="radio" className="hidden" name="paymentMethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={() => {}} />
                <FiShoppingBag size={18} className={paymentMethod === 'Razorpay' ? 'text-primary-500' : 'text-gray-600'} />
                <span className="font-medium">Cards/Netbanking</span>
              </div>
              <div
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  paymentMethod === 'UPI' ? 'border-primary-500 bg-primary-900/10 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                }`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <input type="radio" className="hidden" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => {}} />
                <FiSmartphone size={18} className={paymentMethod === 'UPI' ? 'text-primary-500' : 'text-gray-600'} />
                <span className="font-medium">UPI (GPay, PhonePe)</span>
              </div>
            </div>

            <button
              id="place-order-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-6 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
              ) : (
                <>Place Order ₹{finalTotal.toFixed(0)}</>
              )}
            </button>
          </div>
        </form>

        {/* Order summary */}
        <div className="card p-6 h-fit sticky top-24 animate-slideInRight">
          <h2 className="font-bold text-white text-lg mb-4 pb-3 border-b border-gray-800">Your Order</h2>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
            {cart.items?.map(item => {
              const p = item.product;
              if (!p) return null;
              return (
                <div key={item._id} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{p.name}</p>
                    <p className="text-gray-500 text-xs">x{item.quantity}</p>
                  </div>
                  <span className="text-gray-300 text-sm font-semibold">₹{(p.price * item.quantity).toFixed(0)}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-400 text-sm">
                <span className="flex items-center gap-1"><FiTag size={12} /> {coupon.code}</span>
                <span>-₹{discount.toFixed(0)}</span>
              </div>
            )}
            {usePoints && pointsToUse > 0 && (
              <div className="flex justify-between text-yellow-400 text-sm">
                <span className="flex items-center gap-1"><FiStar size={12} /> Points Used ({pointsToUse})</span>
                <span>-₹{pointsToUse.toFixed(0)}</span>
              </div>
            )}
            
            {/* Eco Carbon Widget */}
            {avgEcoScore > 0 && (
              <div className="flex justify-between text-green-400 text-sm mt-3 pt-3 border-t border-gray-800 border-dashed">
                <span className="flex items-center gap-1.5 font-semibold"><span className="text-xl">🌿</span> CO2 Reduction</span>
                <span className="font-bold">~{(avgEcoScore * 0.12).toFixed(1)} kg</span>
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-gray-800 flex justify-between font-bold text-white text-lg">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* UPI Dummy Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !loading && setShowUpiModal(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-zoomIn">
            <button 
              onClick={() => setShowUpiModal(false)} 
              disabled={loading}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                <FiSmartphone size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pay via UPI</h3>
              <p className="text-gray-400 text-sm">Scan the QR code below using any UPI app to pay <strong className="text-white">₹{finalTotal.toFixed(0)}</strong></p>
            </div>

            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              {/* Dummy QR Code using a random QR image generator */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=freshmart@upi&pn=FreshMart&am=${finalTotal.toFixed(0)}&cu=INR`} 
                alt="UPI QR Code" 
                className="w-full h-full"
              />
            </div>

            <form onSubmit={handleUpiSubmit}>
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-semibold tracking-wider">Transaction ID (Dummy)</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012"
                  value={upiTxnId}
                  onChange={e => setUpiTxnId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-center tracking-widest font-mono"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={upiTxnId.length !== 12 || loading}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center h-[52px]"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
