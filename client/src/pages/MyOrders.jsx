import { useState, useEffect } from 'react';
import axios, { downloadInvoice } from '../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiPackage, FiClock, FiMapPin } from 'react-icons/fi';

const ORDER_STEPS = [
  { key: 'pending',    label: 'Order Placed',    icon: '🛒' },
  { key: 'processing', label: 'Being Prepared',  icon: '👨‍🍳' },
  { key: 'shipped',    label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered',  label: 'Delivered',        icon: '🎉' },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

const statusColors = {
  pending:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20   text-blue-400   border-blue-500/30',
  shipped:    'bg-purple-500/20  text-purple-400  border-purple-500/30',
  delivered:  'bg-green-500/20  text-green-400   border-green-500/30',
  cancelled:  'bg-red-500/20    text-red-400     border-red-500/30',
};

const OrderStatusBar = ({ status }) => {
  if (status === 'cancelled') return (
    <div className="flex items-center gap-2 py-3 px-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm font-semibold">
      ❌ This order was cancelled.
    </div>
  );

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center w-full my-4 gap-0">
      {ORDER_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const isLast = idx === ORDER_STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* Step circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-500 ${
                active
                  ? 'border-primary-500 bg-primary-900/60 shadow-[0_0_12px_rgba(34,197,94,0.4)] scale-110'
                  : done
                    ? 'border-primary-700 bg-primary-900/30'
                    : 'border-gray-700 bg-gray-900 opacity-40'
              }`}>
                {step.icon}
              </div>
              <p className={`text-[10px] mt-1 font-semibold text-center leading-tight w-14 truncate ${
                done ? (active ? 'text-primary-400' : 'text-gray-400') : 'text-gray-700'
              }`}>{step.label}</p>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-700 ${
                idx < currentIdx ? 'bg-primary-700' : 'bg-gray-800'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/orders');
        setOrders(data.orders || data.data || []);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDownload = async (id) => {
    try {
      const response = await downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary-900/40 rounded-xl text-primary-500">
          <FiPackage size={24} />
        </div>
        <h1 className="text-3xl font-bold text-white">My Orders</h1>
        <span className="badge ml-2">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 card border-dashed border-2 border-gray-700">
          <FiPackage size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Go ahead and place your first order!</p>
          <Link to="/products" className="btn-primary px-8 py-3 rounded-full">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => (
            <div key={order._id} className="card border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden">

              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-800">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-base font-bold text-white font-mono">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                      {order.status.toUpperCase()}
                    </span>
                    {order.status === 'pending' && (
                      <span className="text-xs text-yellow-500/70 font-medium animate-pulse">
                        ⏳ Waiting for admin approval
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <FiClock size={13} />
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Total Paid</p>
                  <p className="text-2xl font-black text-white">₹{(order.totalAmount || 0).toFixed(0)}</p>
                  <p className="text-xs text-gray-600">{order.paymentMethod} · {order.items?.length} item(s)</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="px-5 pt-2 pb-1">
                <OrderStatusBar status={order.status} />
              </div>

              {/* Item thumbnails (collapsible) */}
              <div className="px-5 pb-4">
                <button
                  onClick={() => toggleExpand(order._id)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2"
                >
                  {expanded[order._id] ? '▾ Hide items' : `▸ Show ${order.items?.length} item(s)`}
                </button>

                {expanded[order._id] && (
                  <div className="space-y-2 mb-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-primary-400 font-bold text-sm">₹{(item.quantity * item.price).toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <button
                    onClick={() => handleDownload(order._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-semibold text-sm"
                  >
                    <FiDownload size={15} /> Invoice
                  </button>

                  {/* Track Order — available for all non-cancelled states */}
                  {order.status !== 'cancelled' && (
                    <Link
                      to={`/orders/${order._id}/live-tracking`}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        order.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20'
                          : order.status === 'delivered'
                            ? 'bg-green-900/20 text-green-400 border border-green-800 hover:bg-green-900/30'
                            : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20'
                      }`}
                    >
                      <FiMapPin size={15} />
                      {order.status === 'pending'
                        ? 'Track Order'
                        : order.status === 'delivered'
                          ? 'View Summary'
                          : '🛵 Live Track'}
                    </Link>
                  )}

                  {order.status === 'cancelled' && (
                    <span className="flex items-center gap-2 px-4 py-2 bg-red-900/10 text-red-500 border border-red-800 rounded-xl text-sm font-semibold">
                      ❌ Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
