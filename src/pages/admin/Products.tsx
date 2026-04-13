import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { ProductForm } from '../../components/admin/ProductForm';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this product permanently?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 font-medium">Add, update, and manage your luxury product catalog</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20 font-bold"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search products by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl px-12 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <th className="p-6 font-bold text-xs uppercase tracking-widest">Product Info</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-center">Price</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-center">Category</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-slate-800 leading-tight">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="font-black text-primary">${p.price}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {p.categories?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingProduct(p); setShowForm(true); }}
                        className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


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
