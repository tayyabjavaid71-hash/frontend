import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, LayoutGrid, AlertCircle, Loader2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { CategoryForm } from '../../components/admin/CategoryForm';
import { adminService } from '../../services/adminService';

type Category = { id: string; name: string; slug?: string; description?: string; image_url?: string };
type Subcategory = { id: string; name: string; slug?: string; category_id: string; categories?: { name?: string } };

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [subForm, setSubForm] = useState({ name: '', slug: '', category_id: '' });
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subSaving, setSubSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, subs] = await Promise.all([
        adminService.fetchCategories(),
        adminService.fetchSubcategories(),
      ]);
      setCategories(cats || []);
      setSubcategories(subs || []);
      setSubForm((prev) => ({ ...prev, category_id: prev.category_id || cats?.[0]?.id || '' }));
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedSubcategories = useMemo(() => {
    const map = new Map<string, Subcategory[]>();
    categories.forEach((c) => map.set(c.id, []));
    subcategories.forEach((s) => {
      const list = map.get(s.category_id) || [];
      list.push(s);
      map.set(s.category_id, list);
    });
    return map;
  }, [categories, subcategories]);

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category? Linked subcategories and product mappings may be affected.')) return;
    try {
      setDeleteLoading(id);
      await adminService.deleteCategory(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Error deleting category');
    } finally {
      setDeleteLoading(null);
    }
  };

  const startEditSubcategory = (sub: Subcategory) => {
    setEditingSubId(sub.id);
    setSubForm({ name: sub.name || '', slug: sub.slug || '', category_id: sub.category_id });
  };

  const resetSubForm = () => {
    setEditingSubId(null);
    setSubForm({ name: '', slug: '', category_id: categories[0]?.id || '' });
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name || !subForm.category_id) {
      setError('Subcategory name and category are required');
      return;
    }

    try {
      setSubSaving(true);
      setError(null);
      const payload = {
        name: subForm.name.trim(),
        slug: subForm.slug.trim() || subForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
        category_id: subForm.category_id,
      };

      if (editingSubId) {
        await adminService.updateSubcategory(editingSubId, payload);
      } else {
        await adminService.createSubcategory(payload);
      }

      resetSubForm();
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save subcategory');
    } finally {
      setSubSaving(false);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!window.confirm('Delete this subcategory?')) return;
    try {
      setDeleteLoading(id);
      await adminService.deleteSubcategory(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete subcategory');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="animate-spin text-pink-600 size-12 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading category structure...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-semibold">{error}</p>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3"><LayoutGrid size={32} /> Category Architecture</h1>
          <p className="text-slate-600 font-medium mt-2">Manage main categories and nested women fashion subcategories</p>
        </div>
        <motion.button
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-pink-200 font-bold"
        >
          <Plus size={20} /> Add Main Category
        </motion.button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="font-black text-sm uppercase tracking-widest text-slate-500 mb-4">Main Categories</h2>
          <div className="space-y-4">
            {categories.map((c) => (
              <div key={c.id} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {c.image_url ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">Slug: {c.slug || c.name.toLowerCase().replace(/\s+/g, '-')}</p>
                      <p className="text-xs text-slate-500 mt-1">{groupedSubcategories.get(c.id)?.length || 0} subcategories</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCategory(c); setShowForm(true); }} className="px-3 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 font-bold">Edit</button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      disabled={deleteLoading === c.id}
                      className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold disabled:opacity-50"
                    >
                      {deleteLoading === c.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(groupedSubcategories.get(c.id) || []).map((s) => (
                    <span key={s.id} className="px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded-md">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="font-black text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Layers size={14} /> Subcategory Editor</h2>

          <form onSubmit={handleSaveSubcategory} className="space-y-3 mb-5">
            <select
              value={subForm.category_id}
              onChange={(e) => setSubForm((prev) => ({ ...prev, category_id: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              value={subForm.name}
              onChange={(e) => setSubForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Subcategory name"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold"
              required
            />
            <input
              value={subForm.slug}
              onChange={(e) => setSubForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="slug (optional)"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={subSaving}
                className="flex-1 bg-slate-900 text-white rounded-xl py-2 text-sm font-bold hover:bg-black disabled:opacity-50"
              >
                {editingSubId ? 'Update' : 'Add'}
              </button>
              {editingSubId && (
                <button type="button" onClick={resetSubForm} className="px-3 py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200">
                  Reset
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {subcategories.map((sub) => (
              <div key={sub.id} className="border border-slate-100 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{sub.name}</p>
                    <p className="text-xs text-slate-500">{sub.categories?.name || 'Unknown category'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEditSubcategory(sub)} className="text-xs font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">Edit</button>
                    <button
                      onClick={() => handleDeleteSubcategory(sub.id)}
                      disabled={deleteLoading === sub.id}
                      className="text-xs font-bold px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deleteLoading === sub.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setShowForm(false)}
          onSuccess={fetchData}
        />
      )}
    </motion.div>
  );
};
