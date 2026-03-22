import { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: FiUsers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Products', value: stats?.totalProducts, icon: FiPackage, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Orders', value: stats?.totalOrders, icon: FiShoppingBag, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue}`, icon: FiDollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FiTrendingUp size={28} className="text-primary-500" />
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Link to="/admin/users" className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"><FiUsers size={16}/> Manage Users</Link>
          <Link to="/admin/products" className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"><FiPackage size={16}/> Manage Products</Link>
          <Link to="/admin/orders" className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"><FiShoppingBag size={16}/> Manage Orders</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={24} className={color} />
            </div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      {stats?.dailyRevenue?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="card h-96">
            <h2 className="text-xl font-bold text-white mb-6">Revenue Trend (30 Days)</h2>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f3f4f6' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="card h-96">
            <h2 className="text-xl font-bold text-white mb-6">Daily Orders (30 Days)</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f3f4f6' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value) => [value, 'Orders']}
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
        {stats?.recentOrders?.length === 0 ? (
          <p className="text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2">Order ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map(order => (
                  <tr key={order._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 text-gray-400 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 text-gray-300">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 text-white font-semibold">₹{(order.totalAmount || order.totalPrice || 0).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-700 text-gray-300'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
