import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiTruck, FiPackage, FiXCircle, FiArrowLeft } from 'react-icons/fi';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: FiClock, description: 'Your order has been received' },
  { key: 'processing', label: 'Processing', icon: FiPackage, description: 'We are preparing your items' },
  { key: 'shipped', label: 'Shipped', icon: FiTruck, description: 'Your order is on its way' },
  { key: 'delivered', label: 'Delivered', icon: FiCheckCircle, description: 'Package delivered successfully' },
];

const statusIndex = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/orders')
      .then(({ data }) => {
        const found = (data.data || []).find(o => o._id === id);
        setOrder(found || null);
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">Order not found</p>
      <Link to="/profile" className="btn-primary">Back to Profile</Link>
    </div>
  );

  const currentStep = statusIndex[order.status];
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
        <FiArrowLeft /> Back to Profile
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Order Tracking</h1>
      <p className="text-gray-400 mb-8">Order ID: <span className="font-mono text-primary-400">#{order._id.slice(-10).toUpperCase()}</span></p>

      {isCancelled ? (
        <div className="card flex items-center gap-4 border border-red-500/30 bg-red-500/5 mb-8">
          <FiXCircle size={40} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-bold text-lg">Order Cancelled</p>
            <p className="text-gray-400 text-sm">This order was cancelled.</p>
          </div>
        </div>
      ) : (
        <div className="card mb-8">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-700">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            <div className="relative flex justify-between">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary-500 shadow-lg shadow-primary-500/30'
                        : 'bg-gray-800 border border-gray-700'
                    } ${isCurrent ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-gray-900' : ''}`}>
                      <Icon size={20} className={isCompleted ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <p className={`text-xs font-medium text-center ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                    {isCurrent && <p className="text-xs text-gray-400 text-center max-w-20">{step.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800">
              <div>
                <p className="text-white font-medium">{item.name}</p>
                <p className="text-gray-400 text-sm">Qty: {item.quantity} × ₹{item.price}</p>
              </div>
              <p className="text-white font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-gray-400 font-medium">Total</span>
          <span className="text-2xl font-bold text-primary-400">₹{(order.totalAmount || order.totalPrice || 0).toFixed(2)}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">Ordered on: <span className="text-white">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          {order.shippingAddress && (
            <p className="text-sm text-gray-400 mt-1">Shipping to: <span className="text-white">{order.shippingAddress.city}, {order.shippingAddress.state}</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
