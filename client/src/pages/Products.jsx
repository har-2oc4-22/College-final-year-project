import { useState, useEffect, useCallback } from 'react';
import { getProducts, getRecommendations } from '../api/axios';
import ProductCard from '../components/ProductCard';
import AutoCart from '../components/AutoCart';
import { FiSearch, FiFilter, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Pantry'];

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategories, sort]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
      if (sort) params.sort = sort;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      
      const res = await getProducts(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategories, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (user) {
      getRecommendations()
        .then(res => setRecommended(res.data.products || []))
        .catch(() => {});
    }
  }, [user]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handlePriceApply = () => {
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setSort('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-900/60 via-gray-900 to-gray-950 border border-primary-800/30 p-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200')] opacity-10 bg-cover bg-center" />
        <div className="relative">
          <span className="badge mb-3 inline-block">🌿 Fresh & Organic</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Shop Fresh Groceries</h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg">Hand-picked produce, daily essentials, and premium quality at your doorstep.</p>
        </div>
      </div>

      {user && <AutoCart />}

      {recommended.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⭐</span>
            <h2 className="text-lg font-bold text-white">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {recommended.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><FiFilter /> Filters</h3>
              <button onClick={handleClearFilters} className="text-xs text-primary-400 hover:text-primary-300">Clear All</button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input py-2 pl-9 text-sm"
              />
            </div>

            {/* Price Range */}
            <div className="mb-6 border-b border-gray-800 pb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">Price Range</p>
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice} 
                  onChange={e => setMinPrice(e.target.value)} 
                  className="input py-1.5 px-2 text-sm w-full"
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice} 
                  onChange={e => setMaxPrice(e.target.value)} 
                  className="input py-1.5 px-2 text-sm w-full"
                />
              </div>
              <button onClick={handlePriceApply} className="w-full btn-secondary py-1.5 text-xs">Apply Price</button>
            </div>

            {/* Categories */}
            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3">Categories</p>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid & Sorting */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">
              All Products <span className="text-gray-500 text-base font-normal ml-2">({totalItems} results)</span>
            </h2>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input w-auto text-sm py-2"
            >
              <option value="">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-44 bg-gray-800 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card text-center py-20">
              <FiPackage size={48} className="text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">No products found</h3>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or search.</p>
              <button onClick={handleClearFilters} className="mt-4 text-primary-400 hover:text-primary-300 text-sm">Clear styling filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-800/50">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          page === i + 1 
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-900/40' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;
