import { useState, useEffect } from 'react';
import axios, { downloadInvoice } from '../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiChevronDown, FiDownload, FiNavigation } from 'react-icons/fi';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await axios.get('/admin/orders', { params });
      setOrders(data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const [advancingId, setAdvancingId] = useState(null);

  const advanceDelivery = async (orderId) => {
    setAdvancingId(orderId);
    try {
      const { data } = await axios.put(`/tracking/${orderId}/advance`);
      toast.success(`🛵 Stage: ${data.currentStage.label}`, {
        style: { background: '#1f2937', color: '#f9fafb' }
      });
      // Immediately reflect new status in the admin orders table
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.order.status } : o));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot advance — order already fully delivered.');
    } finally {
      setAdvancingId(null);
    }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Order status updated!');
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const handleExportCSV = async () => {
    try {
      const response = await axios.get('/admin/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Orders exported successfully');
    } catch {
      toast.error('Failed to export orders');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Manage Orders</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="input-field text-sm py-2"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 text-sm">
            <FiRefreshCw size={15} /> Refresh
          </button>
          <button onClick={handleExportCSV} className="btn-primary flex items-center gap-2 text-sm">
            <FiDownload size={15} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr className="text-gray-400">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Current Status</th>
                  <th className="text-left py-3 px-4">Update Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Invoice</th>
                  <th className="text-left py-3 px-4">Live Track</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-500">No orders found</td></tr>
                ) : orders.map(order => (
                  <tr key={order._id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{order.user?.name || 'Unknown'}</p>
                      <p className="text-gray-500 text-xs">{order.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{order.items?.length || 0} items</td>
                    <td className="py-3 px-4 text-white font-semibold">₹{(order.totalAmount || order.totalPrice || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-700 text-gray-300'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5"
                        value={order.status}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDownload(order._id)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Download Invoice">
                        <FiDownload size={14} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => advanceDelivery(order._id)}
                          disabled={advancingId === order._id || order.status === 'delivered' || order.status === 'cancelled'}
                          title={order.status === 'pending' ? "Approve order and start live tracking" : "Advance delivery stage (broadcasts to live tracking)"}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                            order.status === 'pending' 
                              ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
                              : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                          }`}
                        >
                          {advancingId === order._id
                            ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            : <FiNavigation size={12} />}
                          {order.status === 'pending' ? 'Approve' : 'Advance'}
                        </button>
                        <Link
                          to={`/orders/${order._id}/live-tracking`}
                          target="_blank"
                          className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                          title="Open live tracking page"
                        >
                          🛵
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
