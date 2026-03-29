import { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiSearch,
  FiCalendar, FiPackage
} from 'react-icons/fi';
import { FaLeaf, FaBolt } from 'react-icons/fa';

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Pantry', 'Other'];
const ECO_IMPACTS = ['High Carbon Footprint', 'Moderate Check', 'Eco-Friendly', 'Planet Hero'];

const emptyForm = {
  name: '', description: '', price: '', category: 'Fruits', image: '', stock: 100, unit: 'piece',
  ecoScore: 50, ecoImpact: 'Moderate Check', carbonFootprint: 0, isOrganic: false, origin: '',
  expiryDate: '',
  nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  flashSale: { active: false, discountPercent: 0, expiresAt: '' },
};

const Section = ({ title, icon, children }) => (
  <div className="border border-gray-700/60 rounded-xl p-4 space-y-3">
    <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">{icon}{title}</h3>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNutrition = (key, val) => setForm(f => ({ ...f, nutritionInfo: { ...f.nutritionInfo, [key]: val } }));
  const setFlash = (key, val) => setForm(f => ({ ...f, flashSale: { ...f.flashSale, [key]: val } }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    toast.loading('Uploading image...', { id: 'upload' });
    try {
      const { data } = await axios.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setField('image', data.url);
      toast.success('Image uploaded!', { id: 'upload' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/products', { params: { limit: 100, search: search || undefined } });
      setProducts(data.data || []);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingProduct(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({
      ...emptyForm,
      ...p,
      expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
      nutritionInfo: { ...emptyForm.nutritionInfo, ...(p.nutritionInfo || {}) },
      flashSale: {
        active: p.flashSale?.active || false,
        discountPercent: p.flashSale?.discountPercent || 0,
        expiresAt: p.flashSale?.expiresAt ? new Date(p.flashSale.expiresAt).toISOString().split('T')[0] : '',
      },
    });
    setEditingProduct(p._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingProduct(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        ecoScore: Number(form.ecoScore),
        carbonFootprint: Number(form.carbonFootprint),
        expiryDate: form.expiryDate || null,
        nutritionInfo: {
          calories: Number(form.nutritionInfo.calories),
          protein: Number(form.nutritionInfo.protein),
          carbs: Number(form.nutritionInfo.carbs),
          fat: Number(form.nutritionInfo.fat),
          fiber: Number(form.nutritionInfo.fiber),
        },
        flashSale: {
          active: form.flashSale.active,
          discountPercent: Number(form.flashSale.discountPercent),
          salePrice: form.flashSale.active
            ? Number(form.price) * (1 - Number(form.flashSale.discountPercent) / 100)
            : 0,
          expiresAt: form.flashSale.expiresAt || null,
        },
      };
      if (editingProduct) {
        await axios.put(`/admin/products/${editingProduct}`, payload);
        toast.success('Product updated!');
      } else {
        await axios.post('/admin/products', payload);
        toast.success('Product created!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    // Replaced native confirm with direct delete since browsers sometimes block native dialogs
    try {
      await axios.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success(`Deleted ${name}`);
    } catch (err) { 
      toast.error(err.response?.data?.message || err.message || 'Failed to delete product'); 
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Expiry status helper
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: 'Expired', cls: 'text-red-400' };
    if (daysLeft <= 7) return { label: `${daysLeft}d left`, cls: 'text-orange-400' };
    if (daysLeft <= 30) return { label: `${daysLeft}d left`, cls: 'text-yellow-400' };
    return { label: `${daysLeft}d left`, cls: 'text-green-400' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <button type="submit" className="btn-secondary text-sm px-4">Search</button>
        {search && <button type="button" onClick={() => { setSearch(''); fetchProducts(); }} className="text-xs text-gray-400 hover:text-white">Clear</button>}
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr className="text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Expiry</th>
                  <th className="text-left py-3 px-4">Carbon</th>
                  <th className="text-left py-3 px-4">Eco</th>
                  <th className="text-left py-3 px-4">Rating</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16 text-gray-500">No products found</td></tr>
                ) : products.map(product => {
                  const expiry = getExpiryStatus(product.expiryDate);
                  return (
                    <tr key={product._id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                          <div>
                            <p className="text-white font-medium text-sm line-clamp-1">{product.name}</p>
                            {product.isOrganic && <span className="text-[10px] text-green-400 font-semibold">🌿 Organic</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{product.category}</td>
                      <td className="py-3 px-4">
                        <span className="text-primary-400 font-semibold">₹{product.price}</span>
                        {product.flashSale?.active && (
                          <span className="ml-1 text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-bold">SALE</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`${product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {expiry ? <span className={`text-xs font-medium ${expiry.cls}`}>{expiry.label}</span> : <span className="text-gray-700 text-xs">—</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-xs">{product.carbonFootprint ? `${product.carbonFootprint} kg` : '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          product.ecoScore >= 75 ? 'bg-green-900/40 text-green-400' :
                          product.ecoScore >= 50 ? 'bg-yellow-900/40 text-yellow-400' :
                          'bg-red-900/40 text-red-400'
                        }`}>{product.ecoScore}</span>
                      </td>
                      <td className="py-3 px-4 text-yellow-400 text-xs">⭐ {product.rating?.toFixed(1)} <span className="text-gray-500">({product.numReviews})</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(product)} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors" title="Edit">
                            <FiEdit size={14} />
                          </button>
                          <button onClick={() => handleDelete(product._id, product.name)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors" title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6 py-4 rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-white">{editingProduct ? '✏️ Edit Product' : '➕ New Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* Basic Info */}
              <Section title="Basic Information" icon={<FiPackage size={14} className="text-primary-400" />}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Field label="Product Name *">
                      <input className="input" type="text" required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Organic Bananas" />
                    </Field>
                  </div>
                  <Field label="Price (₹) *">
                    <input className="input" type="number" required min="0" step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} />
                  </Field>
                  <Field label="Stock *">
                    <input className="input" type="number" required min="0" value={form.stock} onChange={e => setField('stock', e.target.value)} />
                  </Field>
                  <Field label="Unit">
                    <input className="input" type="text" value={form.unit} onChange={e => setField('unit', e.target.value)} placeholder="kg / litre / piece" />
                  </Field>
                  <Field label="Category *">
                    <select className="input" value={form.category} onChange={e => setField('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <div className="col-span-2">
                    <Field label="Description">
                      <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Short product description..." />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* Image */}
              <Section title="Product Image" icon="🖼️">
                <div className="flex gap-4 items-start">
                  {form.image && <img src={form.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-700 flex-shrink-0" />}
                  <div className="flex-1 space-y-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading}
                      className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-500/10 file:text-primary-400 hover:file:bg-primary-500/20" />
                    <input type="url" placeholder="Or paste image URL..." className="input py-2 text-sm"
                      value={form.image} onChange={e => setField('image', e.target.value)} />
                  </div>
                </div>
              </Section>

              {/* Expiry & Origin */}
              <Section title="Expiry & Origin" icon={<FiCalendar size={14} className="text-orange-400" />}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry Date">
                    <input className="input" type="date" value={form.expiryDate} onChange={e => setField('expiryDate', e.target.value)} />
                  </Field>
                  <Field label="Origin (Country / Region)">
                    <input className="input" type="text" value={form.origin} onChange={e => setField('origin', e.target.value)} placeholder="e.g. India, Maharashtra" />
                  </Field>
                </div>
              </Section>

              {/* Eco & Carbon */}
              <Section title="Eco & Carbon Data" icon={<FaLeaf size={14} className="text-green-400" />}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={`Eco Score: ${form.ecoScore}/100`}>
                    <input type="range" min="0" max="100" value={form.ecoScore} onChange={e => setField('ecoScore', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>0 (Bad)</span><span>100 (Best)</span>
                    </div>
                  </Field>
                  <Field label="Carbon Footprint (kg CO₂)">
                    <input className="input" type="number" min="0" step="0.01" value={form.carbonFootprint} onChange={e => setField('carbonFootprint', e.target.value)} placeholder="e.g. 2.5" />
                  </Field>
                  <Field label="Eco Impact Level">
                    <select className="input" value={form.ecoImpact} onChange={e => setField('ecoImpact', e.target.value)}>
                      {ECO_IMPACTS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </Field>
                  <Field label="Certified Organic">
                    <div className="flex items-center gap-3 mt-2">
                      <button type="button" onClick={() => setField('isOrganic', !form.isOrganic)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${form.isOrganic ? 'bg-green-600' : 'bg-gray-700'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.isOrganic ? 'translate-x-6' : ''}`} />
                      </button>
                      <span className={`text-sm font-medium ${form.isOrganic ? 'text-green-400' : 'text-gray-500'}`}>
                        {form.isOrganic ? '🌿 Organic Certified' : 'Not Organic'}
                      </span>
                    </div>
                  </Field>
                </div>
              </Section>

              {/* Nutrition */}
              <Section title="Nutrition Info (per serving)" icon={<FaBolt size={14} className="text-yellow-400" />}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Calories (kcal)', key: 'calories' },
                    { label: 'Protein (g)', key: 'protein' },
                    { label: 'Carbs (g)', key: 'carbs' },
                    { label: 'Fat (g)', key: 'fat' },
                    { label: 'Fiber (g)', key: 'fiber' },
                  ].map(({ label, key }) => (
                    <Field key={key} label={label}>
                      <input className="input" type="number" min="0" step="0.1"
                        value={form.nutritionInfo[key]} onChange={e => setNutrition(key, e.target.value)} />
                    </Field>
                  ))}
                </div>
              </Section>

              {/* Flash Sale */}
              <Section title="Flash Sale" icon="⚡">
                <div className="flex items-center gap-3 mb-3">
                  <button type="button" onClick={() => setFlash('active', !form.flashSale.active)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${form.flashSale.active ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.flashSale.active ? 'translate-x-6' : ''}`} />
                  </button>
                  <span className={`text-sm font-medium ${form.flashSale.active ? 'text-orange-400' : 'text-gray-500'}`}>
                    {form.flashSale.active ? '⚡ Flash Sale Active' : 'Flash Sale Off'}
                  </span>
                </div>
                {form.flashSale.active && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Discount (%)">
                      <input className="input" type="number" min="1" max="99"
                        value={form.flashSale.discountPercent} onChange={e => setFlash('discountPercent', e.target.value)} />
                    </Field>
                    <Field label="Sale Ends On">
                      <input className="input" type="date" value={form.flashSale.expiresAt} onChange={e => setFlash('expiresAt', e.target.value)} />
                    </Field>
                    {form.price && form.flashSale.discountPercent > 0 && (
                      <div className="col-span-2 bg-orange-900/20 border border-orange-800/50 rounded-xl p-3 text-sm">
                        <span className="text-gray-400">Sale price: </span>
                        <span className="text-orange-400 font-bold text-lg">
                          ₹{(Number(form.price) * (1 - form.flashSale.discountPercent / 100)).toFixed(2)}
                        </span>
                        <span className="text-gray-500 line-through ml-2 text-xs">₹{form.price}</span>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploading} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  <FiSave size={16} /> {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
