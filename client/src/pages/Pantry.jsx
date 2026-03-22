import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FiBox, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ----------------- Sub-component defined OUTSIDE render -----------------
const PantryItemCard = ({ item, onConsume }) => (
  <div className="card p-4 flex gap-4 items-center group relative overflow-hidden">
    {item.product?.image && (
      <img
        src={item.product.image}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'; }}
        alt={item.product?.name}
      />
    )}
    <div className="flex-1 min-w-0">
      <h3 className="text-white font-semibold text-sm truncate">{item.product?.name || 'Product'}</h3>
      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
        <FiCalendar size={10} /> Bought: {new Date(item.purchaseDate).toLocaleDateString()}
      </div>
      <div className={`flex items-center gap-2 text-[11px] font-bold mt-1 ${
        item.status === 'Expiring Soon' ? 'text-amber-400' :
        item.status === 'Expired' ? 'text-red-500' :
        item.status === 'Consumed' ? 'text-gray-600' : 'text-green-400'
      }`}>
        <FiClock size={10} /> Exp: {new Date(item.expiryDate).toLocaleDateString()}
      </div>
      <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
        item.status === 'Fresh' ? 'bg-green-900/40 text-green-400' :
        item.status === 'Expiring Soon' ? 'bg-amber-900/40 text-amber-400' :
        item.status === 'Expired' ? 'bg-red-900/40 text-red-400' :
        'bg-gray-800 text-gray-500'
      }`}>{item.status}</span>
    </div>
    {item.status !== 'Consumed' && item.status !== 'Expired' && (
      <button
        onClick={() => onConsume(item._id)}
        className="bg-gray-800 hover:bg-green-600 text-white p-2 rounded-full transition-all duration-300 shadow-lg flex-shrink-0"
        title="Mark as Consumed"
      >
        <FiCheckCircle size={16} />
      </button>
    )}
    {item.status === 'Expiring Soon' && (
      <div className="absolute top-2 right-2">
        <FiAlertCircle className="text-amber-500 animate-pulse" size={14} />
      </div>
    )}
  </div>
);

const PantrySection = ({ title, items, icon: Icon, colorClass, emptyMsg }) => (
  <div className="mb-10">
    <h2 className={`text-xl font-bold flex items-center gap-2 mb-4 ${colorClass}`}>
      <Icon size={20} /> {title} <span className="text-sm font-normal text-gray-500">({items.length})</span>
    </h2>
    {items.length === 0 ? (
      <p className="text-gray-600 italic text-sm ml-7">{emptyMsg}</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => <PantryItemCard key={item._id} item={item} onConsume={() => {}} />)}
      </div>
    )}
  </div>
);
// -----------------------------------------------------------------------

const Pantry = () => {
  const [pantry, setPantry] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPantry = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/pantry');
      setPantry(data.data);
    } catch (err) {
      toast.error('Failed to load pantry. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPantry();
  }, []);

  const handleConsume = async (itemId) => {
    try {
      await axios.put(`/pantry/${itemId}/consume`);
      toast.success('Marked as consumed! 🍽️');
      fetchPantry();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" />
    </div>
  );

  const freshItems = pantry?.items?.filter(i => i.status === 'Fresh') || [];
  const expiringSoon = pantry?.items?.filter(i => i.status === 'Expiring Soon') || [];
  const expired = pantry?.items?.filter(i => i.status === 'Expired') || [];
  const consumed = pantry?.items?.filter(i => i.status === 'Consumed') || [];

  // Attach handleConsume to cards dynamically
  const renderSection = (title, items, icon, colorClass, emptyMsg) => (
    <div className="mb-10">
      <h2 className={`text-xl font-bold flex items-center gap-2 mb-4 ${colorClass}`}>
        {icon} {title} <span className="text-sm font-normal text-gray-500">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-gray-600 italic text-sm ml-7">{emptyMsg}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex gap-4 items-center group relative overflow-hidden">
              {item.product?.image && (
                <img
                  src={item.product.image}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'; }}
                  alt={item.product?.name}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">{item.product?.name || 'Product'}</h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                  <FiCalendar size={10} /> Bought: {new Date(item.purchaseDate).toLocaleDateString()}
                </div>
                <div className={`flex items-center gap-2 text-[11px] font-bold mt-1 ${
                  item.status === 'Expiring Soon' ? 'text-amber-400' :
                  item.status === 'Expired' ? 'text-red-500' :
                  item.status === 'Consumed' ? 'text-gray-600' : 'text-green-400'
                }`}>
                  <FiClock size={10} /> Expires: {new Date(item.expiryDate).toLocaleDateString()}
                </div>
              </div>
              {item.status !== 'Consumed' && item.status !== 'Expired' && (
                <button
                  onClick={() => handleConsume(item._id)}
                  className="bg-gray-800 hover:bg-green-600 text-white p-2 rounded-full transition-all duration-300 flex-shrink-0"
                  title="Mark as Consumed"
                >
                  <FiCheckCircle size={16} />
                </button>
              )}
              {item.status === 'Expiring Soon' && (
                <div className="absolute top-2 right-2">
                  <FiAlertCircle className="text-amber-500 animate-pulse" size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FiBox className="text-primary-500" /> Digital Pantry
        </h1>
        <p className="text-gray-400">Track your groceries and reduce food waste with automatic expiry alerts.</p>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Fresh', count: freshItems.length, color: 'text-green-400 bg-green-900/20 border-green-800' },
            { label: 'Expiring Soon', count: expiringSoon.length, color: 'text-amber-400 bg-amber-900/20 border-amber-800' },
            { label: 'Expired', count: expired.length, color: 'text-red-400 bg-red-900/20 border-red-800' },
            { label: 'Consumed', count: consumed.length, color: 'text-gray-400 bg-gray-900/20 border-gray-800' },
          ].map(s => (
            <div key={s.label} className={`card p-3 text-center border ${s.color}`}>
              <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {expiringSoon.length > 0 && renderSection(
        'Expiring Soon', expiringSoon, <FiAlertCircle size={20} />, 'text-amber-400',
        ''
      )}
      {renderSection('Fresh Inventory', freshItems, <FiCheckCircle size={20} />, 'text-green-400', 'Your pantry is empty. Place an order to see your items here!')}
      {expired.length > 0 && renderSection('Expired Items', expired, <FiXCircle size={20} />, 'text-red-500', '')}

      {consumed.length > 0 && (
        <div className="mt-12">
          <h2 className="text-gray-500 text-base font-bold mb-3 uppercase tracking-wider">Recently Consumed</h2>
          <div className="flex flex-wrap gap-2">
            {consumed.slice(0, 12).map(item => (
              <span key={item._id} className="bg-gray-900 border border-gray-800 text-gray-500 px-3 py-1 rounded-full text-xs">
                ✓ {item.product?.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pantry;
