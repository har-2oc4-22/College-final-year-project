import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/wishlist');
      setProducts(data.data || []);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await axios.delete(`/wishlist/${productId}`);
      setProducts(data.data || []);
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    await addItem(product._id, 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <FiHeart className="text-red-500" /> My Wishlist
        <span className="text-lg text-gray-400 font-normal">({products.length} items)</span>
      </h1>
      <p className="text-gray-400 mb-8">Your saved products for later</p>

      {products.length === 0 ? (
        <div className="card text-center py-16">
          <FiHeart size={64} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="card group hover:shadow-primary-500/20 hover:shadow-lg transition-all duration-300">
              <div className="relative mb-4 overflow-hidden rounded-xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.src = 'https://via.placeholder.com/200'; }}
                />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  title="Remove from wishlist"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-gray-400 text-xs mb-2 capitalize">{product.category}</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-700">
                <span className="text-primary-400 font-bold text-lg">₹{product.price}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"
                  disabled={product.stock === 0}
                >
                  <FiShoppingCart size={14} />
                  {product.stock === 0 ? 'Out' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
