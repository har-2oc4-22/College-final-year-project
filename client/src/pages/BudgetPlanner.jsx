import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { optimizeBudget } from '../api/axios';
import toast from 'react-hot-toast';
import { FiDollarSign, FiShoppingCart, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const BudgetPlanner = () => {
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [addingAll, setAddingAll] = useState(false);
  const { addItem } = useCart();

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!budget || budget <= 0) return toast.error('Enter a valid budget amount.');
    if (budget < 100) return toast.error('Minimum budget is ₹100.');

    setLoading(true);
    setResult(null);
    try {
      const { data } = await optimizeBudget({ budget: Number(budget), preferences });
      setResult(data);
      toast.success('AI Budget Plan ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Budget optimization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = async () => {
    if (!result?.items) return;
    setAddingAll(true);
    let count = 0;
    for (const item of result.items) {
      if (item.found && item.product) {
        await addItem(item.product._id, item.quantity || 1);
        count++;
      }
    }
    setAddingAll(false);
    if (count > 0) toast.success(`Added ${count} items to your cart! 🛒`);
  };

  const budgetPresets = [500, 1000, 2000, 5000];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <span className="text-4xl">🧠</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">AI Budget Planner</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Tell us your budget. Our AI builds the most nutritious, value-packed grocery cart for you automatically!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="card p-6 animate-fadeInUp">
          <form onSubmit={handleOptimize} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Monthly Grocery Budget (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiDollarSign className="text-emerald-400" size={20} />
                </div>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="pl-12 w-full py-4 bg-gray-900 border-2 border-gray-800 rounded-2xl text-white text-xl font-bold focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="e.g. 2000"
                />
              </div>
              {/* Quick presets */}
              <div className="flex gap-2 mt-3">
                {budgetPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudget(preset)}
                    className={`flex-1 text-sm py-2 rounded-lg border transition-all ${Number(budget) === preset ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-emerald-500/40'}`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Dietary Preferences <span className="text-gray-600">(optional)</span></label>
              <textarea
                value={preferences}
                onChange={e => setPreferences(e.target.value)}
                rows={3}
                className="w-full py-3 px-4 bg-gray-900 border-2 border-gray-800 rounded-2xl text-white focus:outline-none focus:border-emerald-500 transition-all resize-none placeholder-gray-600"
                placeholder="e.g. vegetarian, high protein, avoid sugar, family of 4..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !budget}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Crafting your plan...</>
              ) : '🧠 Optimize My Budget'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="card p-6 animate-fadeInUp">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-gray-400">Your personalized AI grocery plan will appear here!</p>
            </div>
          ) : (
            <>
              {/* AI Tip */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4 flex gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <p className="text-emerald-300 text-sm">{result.tip}</p>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Suggested Items</h3>
                <span className="text-emerald-400 font-bold text-sm">Est. Total: ₹{result.estimatedTotal}</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-5">
                {result.items?.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${item.found ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/20 border-gray-800'}`}>
                    {item.found && item.product ? (
                      <>
                        <img src={item.product.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{item.product.name}</p>
                          <p className="text-gray-500 text-xs">{item.reason}</p>
                          <p className="text-emerald-400 text-xs font-bold">₹{item.estimatedCost} · qty: {item.quantity}</p>
                        </div>
                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-dashed border-gray-700 flex-shrink-0">
                          <FiAlertCircle className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-400 text-sm">{item.name}</p>
                          <p className="text-xs text-red-400">Not in stock</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddAll}
                disabled={addingAll}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {addingAll ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiShoppingCart /> Add All to Cart</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
