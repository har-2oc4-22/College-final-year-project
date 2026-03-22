import { useState, useEffect } from 'react';
import { getActiveFlashSales } from '../api/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const FlashSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await getActiveFlashSales();
        setSales(data.products || []);
      } catch {
        toast.error('Failed to load flash sales');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
    const interval = setInterval(fetchSales, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const CountdownTimer = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
      const tick = () => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) { setTimeLeft('Expired'); return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      };
      tick();
      const t = setInterval(tick, 1000);
      return () => clearInterval(t);
    }, [expiresAt]);
    return (
      <div className="flex items-center gap-1 justify-center">
        {timeLeft.split(':').map((seg, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="bg-gray-900 text-red-400 font-mono font-extrabold text-lg px-3 py-1.5 rounded-lg border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              {seg}
            </span>
            {i < 2 && <span className="text-red-400 font-bold text-xl">:</span>}
          </span>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-full mb-4">
          <span className="text-2xl animate-bounce">⚡</span>
          <span className="text-red-400 font-bold uppercase tracking-widest text-sm">Limited Time Only</span>
          <span className="text-2xl animate-bounce">⚡</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-3">Flash Sales</h1>
        <p className="text-gray-400 max-w-xl mx-auto">Massive discounts. Ticking clocks. Don't blink.</p>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-6">⏰</div>
          <h2 className="text-2xl font-bold text-white mb-3">No Active Flash Sales</h2>
          <p className="text-gray-400">Check back soon — the next sale could drop anytime!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map(product => {
            const discount = product.flashSale?.discountPercent || 0;
            const salePrice = product.flashSale?.salePrice || product.price;
            return (
              <div key={product._id} className="card overflow-hidden border-red-500/20 hover:border-red-500/50 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] transition-all duration-300 animate-fadeInUp group">
                {/* Discount Banner */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
                  <div className="absolute top-3 right-3 bg-red-500 text-white font-extrabold text-sm px-3 py-1 rounded-full shadow-lg animate-pulse-glow">
                    -{discount}% OFF
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="badge bg-gray-900/80">{product.category}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-white text-lg mb-1 truncate">{product.name}</h3>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-extrabold text-red-400">₹{salePrice.toFixed(0)}</span>
                    <span className="text-gray-500 line-through text-sm">₹{product.price}</span>
                    <span className="text-green-400 text-xs font-semibold">Save ₹{(product.price - salePrice).toFixed(0)}</span>
                  </div>

                  {/* Countdown */}
                  <div className="mb-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider text-center mb-2">Ends in</p>
                    <CountdownTimer expiresAt={product.flashSale.expiresAt} />
                  </div>

                  <button
                    onClick={() => { addItem(product._id, 1); }}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/30"
                  >
                    ⚡ Grab Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashSales;
