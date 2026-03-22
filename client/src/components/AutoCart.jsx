import { useState, useEffect } from 'react';
import { getAutoCart } from '../api/axios';
import { useCart } from '../context/CartContext';
import { FiZap, FiShoppingCart, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AutoCart = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    getAutoCart()
      .then(res => setSuggestions(res.data.suggestions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || suggestions.length === 0) return null;

  const addAll = async () => {
    for (const s of suggestions) {
      await addItem(s.productId, s.suggestedQuantity);
    }
    toast.success(`Added ${suggestions.length} items from your auto-cart! 🛒`);
  };

  return (
    <div className="mb-8 card border-primary-800/40 overflow-hidden">
      <button
        id="autocart-toggle"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-10 h-10 bg-primary-900/60 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiZap size={18} className="text-primary-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">
            ⚡ Auto-Cart Suggestion
          </h3>
          <p className="text-gray-400 text-xs">Based on your order history — {suggestions.length} items ready</p>
        </div>
        {open ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-800 animate-fadeInUp">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-4">
            {suggestions.map(s => (
              <div key={s.productId} className="bg-gray-800/60 rounded-xl p-3 flex flex-col gap-2 border border-gray-700">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-20 object-cover rounded-lg"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'; }}
                />
                <p className="text-white text-xs font-medium line-clamp-1">{s.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary-400 text-xs font-bold">₹{s.currentPrice}</span>
                  <span className="text-gray-500 text-xs">x{s.suggestedQuantity}</span>
                </div>
                <button
                  onClick={() => addItem(s.productId, s.suggestedQuantity)}
                  className="flex items-center justify-center gap-1 w-full bg-primary-700/50 hover:bg-primary-600 text-primary-300 hover:text-white text-xs py-1.5 rounded-lg transition-all duration-200"
                >
                  <FiShoppingCart size={12} /> Add
                </button>
              </div>
            ))}
          </div>
          <button
            id="autocart-add-all"
            onClick={addAll}
            className="btn-primary w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            <FiShoppingCart size={16} /> Add All {suggestions.length} Items to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoCart;
