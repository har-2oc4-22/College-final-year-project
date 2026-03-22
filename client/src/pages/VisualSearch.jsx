import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { visualSearch } from '../api/axios';
import toast from 'react-hot-toast';

const VisualSearch = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addItem } = useCart();
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setPreview(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!image) return toast.error('Please upload an image first.');
    setLoading(true);
    try {
      const { data } = await visualSearch(image);
      setResult(data);
      if (data.products.length === 0) toast.error('No matching products found in our store.');
      else toast.success(`Found ${data.products.length} matching products!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Visual search failed.');
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = {
    high: 'text-green-400 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    low: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <span className="text-4xl">📸</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">Visual Product Search</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Snap a photo of any food or grocery item. Our AI identifies it and finds matching products instantly!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <div className="card p-6 animate-fadeInUp">
          <h2 className="font-bold text-white text-lg mb-4">Upload Image</h2>
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${preview ? 'border-purple-500/50' : 'border-gray-700 hover:border-purple-500/40 hover:bg-gray-800/50'}`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-72 object-cover" />
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6">
                <div className="text-5xl mb-4">🖼️</div>
                <p className="text-white font-semibold mb-1">Click to upload a photo</p>
                <p className="text-gray-500 text-sm">JPG, PNG, WEBP up to 10MB</p>
                <p className="text-purple-400 text-xs mt-3 font-medium">📷 Or take a photo directly from your camera</p>
              </div>
            )}
            {preview && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white font-semibold bg-black/50 px-4 py-2 rounded-lg">Change Image</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />

          <button
            onClick={handleSearch}
            disabled={!image || loading}
            className="w-full mt-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : '🔍 Identify & Search'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="card p-6 animate-fadeInUp">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="text-5xl mb-4 animate-bounce">🤖</div>
              <p className="text-gray-400">AI results will appear here after you upload and search!</p>
            </div>
          ) : (
            <>
              {/* AI Detection Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-4 ${confidenceColor[result.identified?.confidence] || confidenceColor.medium}`}>
                <span className="capitalize">{result.identified?.confidence} confidence</span>
              </div>
              <h2 className="font-extrabold text-white text-xl mb-1">
                🔍 Identified: <span className="text-purple-400">{result.identified?.name}</span>
              </h2>
              <p className="text-gray-500 text-sm mb-5">Category: {result.identified?.category}</p>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {result.products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No products found in store for this image.</p>
                    <p className="text-sm mt-1">Try a clearer photo or different angle.</p>
                  </div>
                ) : result.products.map(p => (
                  <div key={p._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                    <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{p.name}</p>
                      <p className="text-primary-400 font-bold">₹{p.price}</p>
                    </div>
                    <button
                      onClick={() => addItem(p._id, 1)}
                      className="flex-shrink-0 text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                    >
                      + Cart
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualSearch;
