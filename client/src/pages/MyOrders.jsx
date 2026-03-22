import { useState, useEffect } from 'react';
import axios, { downloadInvoice } from '../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiPackage, FiClock } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/30',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary-900/40 rounded-xl text-primary-500">
          <FiPackage size={24} />
        </div>
        <h1 className="text-3xl font-bold text-white">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 card border-dashed border-2 border-gray-700">
          <FiPackage size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">No active orders found</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary px-8 py-3 rounded-full">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map(order => (
            <div key={order._id} className="card p-5 sm:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-bold text-white">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <FiClock size={14} /> Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-0.5">Total Amount</p>
                  <p className="text-2xl font-black text-white">₹{(order.totalAmount || order.totalPrice || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center -space-x-3 overflow-hidden">
                  {order.items?.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      title={item.name}
                      alt={item.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-900 object-cover"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }}
                    />
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 relative z-10">
                      +{order.items.length - 4}
                    </div>
                  )}
                  <span className="pl-6 text-sm font-medium text-gray-400">
                    {order.items?.length} item(s) total
                  </span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    onClick={() => handleDownload(order._id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-semibold text-sm"
                  >
                    <FiDownload size={16} /> Invoice
                  </button>

                  {/* Admin Approval / Live Tracking Logic */}
                  {order.status === 'pending' ? (
                    <button
                      disabled
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-500/10 text-yellow-500/50 border border-yellow-500/20 rounded-xl font-semibold text-sm cursor-not-allowed"
                    >
                      ⏳ Awaiting Approval
                    </button>
                  ) : order.status === 'delivered' || order.status === 'cancelled' ? (
                    <button
                      disabled
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-800/50 text-gray-600 rounded-xl font-semibold text-sm cursor-not-allowed"
                    >
                      Tracking Ended
                    </button>
                  ) : (
                    <Link
                      to={`/orders/${order._id}/live-tracking`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-900/20 transition-all active:scale-95 font-bold text-sm"
                    >
                      🛵 Live Track
                    </Link>
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
