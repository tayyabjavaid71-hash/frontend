import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Plus, Edit2, Trash2, LayoutGrid } from 'lucide-react';
import { CategoryForm } from '../../components/admin/CategoryForm';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      const data = await adminService.fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this category? Products linked to it will be unassigned.')) {
      try {
        await adminService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert('Error deleting category');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Product Categories</h1>
          <p className="text-slate-500 font-medium">Manage and organize your brand collections</p>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20 font-bold"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(c => (
          <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <LayoutGrid size={24} />
                )}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setEditingCategory(c); setShowForm(true); }}
                  className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{c.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{c.description || 'No description provided.'}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <CategoryForm 
          category={editingCategory} 
          onClose={() => setShowForm(false)} 
          onSuccess={fetchCategories} 
        />
      )}
    </div>
  );
};
