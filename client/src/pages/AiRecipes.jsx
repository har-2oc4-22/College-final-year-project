import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { generateRecipe } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiSearch, FiShoppingCart, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const AiRecipes = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await generateRecipe(query);
      setResult(response.data);
      toast.success('Recipe generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = async () => {
    if (!result?.ingredients) return;
    
    setAddingToCart(true);
    let addedCount = 0;

    for (const item of result.ingredients) {
      if (item.found && item.product) {
        await addItem(item.product, item.requestedQuantity);
        addedCount++;
      }
    }

    setAddingToCart(false);
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} ingredients to your cart! 🛒`);
      navigate('/cart');
    } else {
      toast.error('No valid products to add.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
      <div className="text-center mb-10 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-orange-500 bg-orange-500/10 mb-4 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
          <span className="text-4xl">🧑‍🍳</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">AI Chef Assistant</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg hover:text-gray-300 transition-colors">
          Tell us what you're craving. Our AI Chef will generate a gourmet recipe and automatically pull the necessary ingredients from our store into your cart!
        </p>
      </div>

      <form onSubmit={handleGenerate} className="max-w-3xl mx-auto mb-12 animate-fadeInUp">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 group-focus-within:text-orange-400 transition-colors" size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-32 py-4 bg-gray-900 border-2 border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg shadow-inner"
            placeholder="e.g. 'Creamy Butter Chicken' or 'Healthy Vegan Breakfast'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cooking...
              </span>
            ) : 'Generate'}
          </button>
        </div>
      </form>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slideUp">
          {/* Recipe Details Column */}
          <div className="card p-6 md:p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-2">{result.recipe.name}</h2>
            <p className="text-gray-400 mb-6 italic border-l-4 border-orange-500 pl-4">"{result.recipe.description}"</p>
            
            <div className="flex gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <FiClock className="text-orange-400" />
                <span className="text-gray-300">Prep: <span className="font-semibold text-white">{result.recipe.prepTime}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <FiClock className="text-orange-400" />
                <span className="text-gray-300">Cook: <span className="font-semibold text-white">{result.recipe.cookTime}</span></span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm">✓</span> 
              Instructions
            </h3>
            <ol className="space-y-4">
              {result.recipe.instructions.map((step, index) => (
                <li key={index} className="flex gap-4 text-gray-300 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 text-gray-400 flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Grocery Ingredients Column */}
          <div className="card p-6 md:p-8 bg-gray-900 border-gray-800 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiShoppingCart className="text-primary-400" /> Required Ingredients
              </h3>
              <span className="badge bg-primary-500/20 text-primary-400">
                {result.matchedCount} items found
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 max-h-[500px] scrollbar-thin scrollbar-thumb-gray-800">
              {result.ingredients.map((item, index) => (
                <div key={index} className={`p-4 rounded-xl border ${item.found ? 'bg-gray-800/50 border-gray-700' : 'bg-red-500/5 border-red-500/20'} transition-all hover:bg-gray-800`}>
                  <div className="flex items-center gap-4">
                    {item.found && item.product ? (
                      <>
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{item.product.name}</h4>
                          <p className="text-xs text-primary-400 font-medium">₹{item.product.price} <span className="text-gray-500">x {item.requestedQuantity}</span></p>
                        </div>
                        <FiCheckCircle className="text-green-500 flex-shrink-0" size={24} />
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700 border-dashed">
                          <FiAlertCircle className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-300">{item.originalText}</h4>
                          <p className="text-xs text-red-400 font-medium mt-1">Not available in store</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={addingToCart || result.matchedCount === 0}
              className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {addingToCart ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiShoppingCart /> Add {result.matchedCount} Items to Cart
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRecipes;
