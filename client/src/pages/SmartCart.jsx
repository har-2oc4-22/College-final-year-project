import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFileText, FiCamera, FiCheckCircle, FiAlertCircle, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { parseSmartCart } from '../api/axios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const SmartCart = () => {
  const [textMode, setTextMode] = useState(false);
  const [textList, setTextList] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload a valid image file');
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setTextList('');
    setImagePreview(null);
    setImageBase64('');
    setResults(null);
  };

  const handleAnalyze = async () => {
    if (textMode && !textList.trim()) return toast.error('Please type your grocery list');
    if (!textMode && !imageBase64) return toast.error('Please upload an image of your list');

    setLoading(true);
    setResults(null);

    try {
      const payload = textMode ? { text: textList } : { imageBase64 };
      const { data } = await parseSmartCart(payload);
      
      setResults(data);
      if (data.matchedCount > 0) {
        toast.success(`Found ${data.matchedCount} matching items!`);
      } else {
        toast.error('Could not find any matching products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze list. Make sure Gemini API is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!results || !results.items) return;
    
    let addedCount = 0;
    results.items.forEach(item => {
      if (item.found && item.product && item.product.stock > 0) {
        // We override the click to bypass single-item logic and just dispatch immediately
        addItem(item.product, item.requestedQuantity);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`Successfully added ${addedCount} items to your cart!`);
      navigate('/cart');
    } else {
      toast.error('No suitable items to add');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4 inline-flex items-center gap-3">
          ✨ AI Smart Vision Cart
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Upload a handwritten note or type your grocery list below. Our powerful AI will magically find the products in our store and add them to your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left pane: Input */}
        <div className="card h-fit sticky top-24">
          <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
            <button 
              onClick={() => setTextMode(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${!textMode ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <FiCamera /> Image Upload
            </button>
            <button 
              onClick={() => setTextMode(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${textMode ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <FiFileText /> Text List
            </button>
          </div>

          {!textMode ? (
            <div className="space-y-4">
              {!imagePreview ? (
                <label className="border-2 border-dashed border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-800/30 transition-all group">
                  <FiUploadCloud size={48} className="text-gray-600 group-hover:text-primary-500 mb-4 transition-colors" />
                  <span className="text-gray-400 font-medium">Click to upload your list</span>
                  <span className="text-sm text-gray-500 mt-2">Supports JPG, PNG</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-700 group">
                  <img src={imagePreview} alt="Grocery List" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={handleClear} className="btn-secondary">Remove Image</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={textList}
              onChange={(e) => setTextList(e.target.value)}
              placeholder="E.g.&#10;2x Milk&#10;A dozen eggs&#10;3 Apples"
              className="w-full h-64 input-field bg-gray-900/50 resize-none font-mono text-sm leading-relaxed"
            />
          )}

          <div className="flex gap-4 mt-6">
            <button 
              onClick={handleAnalyze} 
              disabled={loading || (!textMode && !imageBase64) || (textMode && !textList.trim())}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 font-bold text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>✨ Analyze List</>
              )}
            </button>
            {results && (
              <button onClick={handleClear} className="px-6 btn-secondary py-3">Clear</button>
            )}
          </div>
        </div>

        {/* Right pane: Output */}
        <div>
          {loading ? (
            <div className="card h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-2 animate-bounce">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white">AI is reading your list...</h3>
              <p className="text-gray-400 max-w-sm">Generating magic matches from our database of fresh organic products.</p>
            </div>
          ) : !results ? (
            <div className="card h-full min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-gray-800 bg-transparent">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 text-gray-600">
                <FiFileText size={24} />
              </div>
              <p className="text-gray-500 font-medium">Your parsed items will magically appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" /> Analysis Complete
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Found matches for {results.matchedCount} of {results.extractedCount} items.</p>
                </div>
                {results.matchedCount > 0 && (
                  <button onClick={handleAddAllToCart} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/25">
                    <FiShoppingCart size={16} /> Add All ({results.matchedCount})
                  </button>
                )}
              </div>

              {results.items.length === 0 && (
                <div className="text-center py-10 text-gray-500">I couldn't detect any specific grocery items.</div>
              )}

              <div className="space-y-4">
                {results.items.map((item, idx) => (
                  <div key={idx} className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                        {item.found ? <FiCheckCircle className="text-green-500" /> : <FiAlertCircle className="text-red-500" />}
                        Extracted: <strong className="text-gray-200">"{item.originalText}" (Qty: {item.requestedQuantity})</strong>
                      </p>
                      
                      {item.found ? (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <ProductCard product={item.product} />
                        </div>
                      ) : (
                        <p className="text-red-400 text-sm mt-2">No matching product found in our current inventory.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SmartCart;
