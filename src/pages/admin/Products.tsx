import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Plus, Edit2, Trash2, Search, AlertCircle, Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductForm } from '../../components/admin/ProductForm';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    
    try {
      setDeleteLoading(id);
      const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-600 font-medium mt-2">Add, update, and manage your luxury product catalog</p>
        </div>
        <motion.button 
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-pink-200 font-bold"
        >
          <Plus size={20} /> Add Product
        </motion.button>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search products by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">Loading products...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No products found</p>
          <p className="text-slate-500 text-sm mt-1">{searchTerm ? 'Try a different search' : 'Add your first product to get started'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-6 font-bold text-xs uppercase tracking-widest">Product Info</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-center">Price</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-center">Stock</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-center">Category</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => (
                  <motion.tr 
                    key={p.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.title}</p>
                          <p className="text-xs text-slate-500 mt-1">ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="font-black text-pink-600 text-lg">${p.price}</span>
                      {p.old_price && <p className="text-xs text-slate-400 line-through">${p.old_price}</p>}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`font-bold text-sm ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold">
                        {p.categories?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <motion.button 
                          onClick={() => { setEditingProduct(p); setShowForm(true); }}
                          whileHover={{ scale: 1.1 }}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button 
                          onClick={() => handleDelete(p.id)}
                          disabled={deleteLoading === p.id}
                          whileHover={{ scale: 1.1 }}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                        >
                          {deleteLoading === p.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setShowForm(false)} 
          onSuccess={fetchProducts} 
        />
      )}
    </div>
  );
};
