import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Plus, Edit2, Trash2, LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CategoryForm } from '../../components/admin/CategoryForm';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.fetchCategories();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? Products linked to it will be unassigned.')) return;
    try {
      setDeleteLoading(id);
      await adminService.deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Error deleting category');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="animate-spin text-pink-600 size-12 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-semibold">{error}</p>
        </motion.div>
      )}

      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3"><LayoutGrid size={32} /> Product Categories</h1>
          <p className="text-slate-600 font-medium mt-2">Manage and organize {categories.length} brand collections</p>
        </div>
        <motion.button 
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-pink-200 font-bold"
        >
          <Plus size={20} /> Add Category
        </motion.button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
          <LayoutGrid className="size-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No categories found</p>
          <p className="text-slate-500 text-sm mt-1">Create your first category to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c, idx) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform flex-shrink-0">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <LayoutGrid size={28} />
                  )}
                </div>
                <div className="flex gap-1">
                  <motion.button 
                    onClick={() => { setEditingCategory(c); setShowForm(true); }}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button 
                    onClick={() => handleDelete(c.id)}
                    disabled={deleteLoading === c.id}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    {deleteLoading === c.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </motion.button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{c.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{c.description || 'No description provided.'}</p>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm 
          category={editingCategory} 
          onClose={() => setShowForm(false)} 
          onSuccess={fetchCategories} 
        />
      )}
    </motion.div>
  );
};
