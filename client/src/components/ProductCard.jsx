import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishloading, setWishloading] = useState(false);

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    addItem(product._id, 1);
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setWishloading(true);
    try {
      if (wishlisted) {
        await axios.delete(`/wishlist/${product._id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await axios.post(`/wishlist/${product._id}`);
        setWishlisted(true);
        toast.success('Added to wishlist ❤️');
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('already')) {
        setWishlisted(true);
      } else {
        toast.error('Failed to update wishlist');
      }
    } finally {
      setWishloading(false);
    }
  };

  return (
    <div className="card group hover:border-primary-700 hover:shadow-primary-900/20 hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fadeInUp flex flex-col">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-800">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <span className="absolute top-2 left-2 badge">{product.category}</span>

        {/* Eco Badge */}
        {product.ecoScore >= 75 && (
          <span className="absolute top-2 left-24 bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            🌿 Eco {product.ecoScore}
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={toggleWishlist}
          disabled={wishloading}
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
            wishlisted ? 'bg-red-500 text-white' : 'bg-gray-900/70 text-gray-300 hover:bg-red-500/30 hover:text-red-400'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-amber-900/80 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute bottom-2 left-2 bg-red-900/80 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-base mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2 flex-1">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(star => (
              <FiStar
                key={star}
                size={12}
                className={star <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-600'}
                fill={star <= Math.round(product.rating) ? 'currentColor' : 'none'}
              />
            ))}
            <span className="text-gray-500 text-xs ml-1">({product.numReviews || 0})</span>
          </div>

          {/* Eco Impact Text */}
          {product.ecoScore > 0 && (
            <div className="flex items-center gap-1.5" title={`Sustainability Score: ${product.ecoScore}/100`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                product.ecoScore >= 90 ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : product.ecoScore >= 75 ? 'bg-green-600' : 'bg-yellow-500'
              }`}></span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                {product.ecoImpact}
              </span>
            </div>
          )}
        </div>

        {/* Price + Action */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-primary-400 font-bold text-lg">₹{product.price}</span>
            <span className="text-gray-500 text-xs"> /{product.unit || 'piece'}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            id={`add-cart-${product._id}`}
            className={`flex items-center gap-1.5 text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
              product.stock === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/40'
            }`}
          >
            <FiShoppingCart size={15} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
