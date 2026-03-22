import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FiEdit, FiLock, FiUser, FiMail, FiSave, FiX, FiStar, FiPackage, FiHeadphones } from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setProfileData({ name: user.name, email: user.email });
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/users/profile', profileData);
      toast.success('Profile updated!');
      setEditingProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setLoading(true);
    try {
      await axios.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiUser className="text-primary-500" /> Account Details
            </h2>
            {!editingProfile && (
              <button onClick={() => setEditingProfile(true)} className="btn-secondary flex items-center gap-1 text-sm py-1 px-3">
                <FiEdit size={14} /> Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input className="input-field" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input className="input-field" type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} required />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 flex-1">
                  <FiSave size={16} /> Save
                </button>
                <button type="button" onClick={() => setEditingProfile(false)} className="btn-secondary flex items-center gap-2 flex-1">
                  <FiX size={16} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <FiUser className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-white font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <FiMail className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <FiUser className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <FiLock className="text-primary-500" /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Password</label>
              <input
                className="input-field" type="password" placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                className="input-field" type="password" placeholder="Min 6 characters"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input
                className="input-field" type="password" placeholder="Repeat new password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiLock size={16} /> {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <Link to="/my-orders" className="card flex items-center gap-5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-2xl group-hover:scale-110 transition-transform">
            <FiPackage />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-0.5">My Orders & Tracking</h3>
            <p className="text-gray-400 text-sm">Track active deliveries in real-time</p>
          </div>
        </Link>
        <button onClick={() => document.getElementById('chatbot-toggle')?.click()} className="card flex items-center gap-5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer text-left group">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 text-2xl group-hover:scale-110 transition-transform">
            <FiHeadphones />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-0.5">24/7 Customer Support</h3>
            <p className="text-gray-400 text-sm">Chat with our AI support agent</p>
          </div>
        </button>
      </div>

      {/* Rewards Dashboard */}
      <div className="card mt-6 bg-gradient-to-r from-gray-900 to-indigo-950 border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <span className="text-3xl">🎁</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">FreshRewards Program</h2>
              <p className="text-gray-400 text-sm">Earn 5% cashback in points on every order.</p>
            </div>
          </div>
          <div className="text-center sm:text-right bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
            <p className="text-sm text-gray-400 font-medium mb-1">Available Balance</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-sm">
              {user?.freshPoints || 0}
            </p>
            <p className="text-xs text-yellow-500 mt-1 font-bold flex items-center justify-center sm:justify-end gap-1">
              <FiStar fill="currentColor" /> equals ₹{user?.freshPoints || 0} off
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
