import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Trash2, LayoutGrid, AlertCircle, Loader2, Layers,
  Pencil, X, Check, ChevronDown, Tag, FolderOpen, Search, Hash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = {
  id: string; name: string; slug?: string;
  description?: string; image_url?: string;
};
type Subcategory = {
  id: string; name: string; slug?: string;
  category_id: string; categories?: { name?: string };
};

// ── Colour Palettes ───────────────────────────────────────────────────────────

const PALETTES = [
  { accent: 'bg-pink-500',    light: 'bg-pink-50',    text: 'text-pink-600',    dot: 'bg-pink-400',    chip: 'bg-pink-50 text-pink-700 border-pink-200'          },
  { accent: 'bg-violet-500',  light: 'bg-violet-50',  text: 'text-violet-600',  dot: 'bg-violet-400',  chip: 'bg-violet-50 text-violet-700 border-violet-200'    },
  { accent: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400',    chip: 'bg-blue-50 text-blue-700 border-blue-200'          },
  { accent: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { accent: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400',   chip: 'bg-amber-50 text-amber-700 border-amber-200'       },
  { accent: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  dot: 'bg-orange-400',  chip: 'bg-orange-50 text-orange-700 border-orange-200'    },
  { accent: 'bg-cyan-500',    light: 'bg-cyan-50',    text: 'text-cyan-600',    dot: 'bg-cyan-400',    chip: 'bg-cyan-50 text-cyan-700 border-cyan-200'          },
  { accent: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600',    dot: 'bg-rose-400',    chip: 'bg-rose-50 text-rose-700 border-rose-200'          },
] as const;
const pal = (i: number) => PALETTES[i % PALETTES.length];

// ── Toast System ──────────────────────────────────────────────────────────────

type Toast = { id: number; msg: string; type: 'success' | 'error' };

const ToastContainer: React.FC<{ toasts: Toast[]; remove: (id: number) => void }> = ({ toasts, remove }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold max-w-sm
            ${t.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}
        >
          {t.type === 'success'
            ? <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0"><Check size={11} strokeWidth={3} /></div>
            : <AlertCircle size={16} className="shrink-0 text-red-200" />
          }
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={13} /></button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const add = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++counter.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3800);
  };
  const remove = (id: number) => setToasts((p) => p.filter((t) => t.id !== id));
  return { toasts, add, remove };
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

const ConfirmDialog: React.FC<{
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}> = ({ title, body, onConfirm, onCancel, loading }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 flex items-center justify-center p-4"
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
      </div>
      <div className="flex gap-2 px-6 pb-6">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </motion.div>
  </div>
);

// ── Category Modal ────────────────────────────────────────────────────────────

const CategoryModal: React.FC<{
  category: Partial<Category> | null;
  onClose: () => void;
  onSave: (msg: string) => void;
}> = ({ category, onClose, onSave }) => {
  const isEdit = !!category?.id;
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required'); return; }
    try {
      setSaving(true); setErr('');
      if (isEdit && category?.id) {
        await adminService.updateCategory(category.id, form);
        onSave(`"${form.name}" updated`);
      } else {
        await adminService.createCategory(form);
        onSave(`"${form.name}" created`);
      }
      onClose();
    } catch (e: any) {
      setErr(e.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Gradient header */}
        <div className={`px-6 py-5 ${isEdit ? 'bg-linear-to-r from-blue-600 to-violet-600' : 'bg-linear-to-r from-pink-600 to-rose-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <FolderOpen size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base leading-tight">
                  {isEdit ? 'Edit Category' : 'New Category'}
                </h2>
                {isEdit
                  ? <p className="text-white/60 text-xs font-mono">ID: {category?.id?.slice(0, 8)}…</p>
                  : <p className="text-white/60 text-xs">Fill in the details below</p>
                }
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> {err}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              Name <span className="text-red-500 normal-case font-medium text-[11px]">* required</span>
            </label>
            <input
              ref={nameRef}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-pink-400 bg-slate-50 focus:bg-white transition-all"
              placeholder="e.g. Women, Unstitched, Accessories"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-pink-400 bg-slate-50 focus:bg-white transition-all"
              placeholder="Short description for this category"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Cover Image URL</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 bg-slate-50 focus:bg-white transition-all"
              placeholder="https://…"
            />
            <AnimatePresence>
              {form.image_url && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <img
                    src={form.image_url}
                    alt="preview"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    className="mt-2 h-28 w-full object-cover rounded-xl border-2 border-slate-200"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 disabled:opacity-60 text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors
                ${isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'}`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const AdminCategories: React.FC = () => {
  const { toasts, add: toast, remove: removeToast } = useToasts();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const [catModal, setCatModal] = useState<{ open: boolean; category: Partial<Category> | null }>({
    open: false, category: null,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; body: string; onConfirm: () => void;
  }>({ open: false, title: '', body: '', onConfirm: () => {} });

  const [subForm, setSubForm] = useState({ name: '', slug: '', category_id: '' });
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState('');
  const subNameRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cats, subs] = await Promise.all([
        adminService.fetchCategories(),
        adminService.fetchSubcategories(),
      ]);
      setCategories(cats || []);
      setSubcategories(subs || []);
      setSubForm((prev) => ({ ...prev, category_id: prev.category_id || cats?.[0]?.id || '' }));
    } catch (err: any) {
      toast(err.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Memos ──────────────────────────────────────────────────────────────────

  const grouped = useMemo(() => {
    const map = new Map<string, Subcategory[]>();
    categories.forEach((c) => map.set(c.id, []));
    subcategories.forEach((s) => {
      const arr = map.get(s.category_id) || [];
      arr.push(s);
      map.set(s.category_id, arr);
    });
    return map;
  }, [categories, subcategories]);

  const categoryIndex = useMemo(() => {
    const m = new Map<string, number>();
    categories.forEach((c, i) => m.set(c.id, i));
    return m;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q),
    );
  }, [categories, search]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleExpand = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleDeleteCategory = (id: string, name: string) => {
    setConfirmDialog({
      open: true,
      title: `Delete "${name}"?`,
      body: 'All subcategories will be permanently removed. Products linked to this category will be unlinked but not deleted.',
      onConfirm: async () => {
        try {
          setDeleteLoading(id);
          setConfirmDialog((p) => ({ ...p, open: false }));
          await adminService.deleteCategory(id);
          toast(`"${name}" deleted`);
          await fetchData();
        } catch (err: any) {
          toast(err.message || 'Delete failed', 'error');
        } finally { setDeleteLoading(null); }
      },
    });
  };

  const startEditSub = (sub: Subcategory) => {
    setEditingSubId(sub.id);
    setSubForm({ name: sub.name, slug: sub.slug || '', category_id: sub.category_id });
    setSubError('');
    setTimeout(() => subNameRef.current?.focus(), 60);
  };

  const resetSubForm = () => {
    setEditingSubId(null);
    setSubForm({ name: '', slug: '', category_id: categories[0]?.id || '' });
    setSubError('');
  };

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.category_id) {
      setSubError('Name and parent category are required');
      return;
    }
    try {
      setSubSaving(true); setSubError('');
      const payload = {
        name: subForm.name.trim(),
        slug: subForm.slug.trim() || undefined,
        category_id: subForm.category_id,
      };
      if (editingSubId) {
        await adminService.updateSubcategory(editingSubId, payload);
        toast(`"${payload.name}" updated`);
      } else {
        await adminService.createSubcategory(payload);
        toast(`"${payload.name}" added`);
      }
      resetSubForm();
      await fetchData();
    } catch (err: any) {
      setSubError(err.message || 'Failed to save');
    } finally { setSubSaving(false); }
  };

  const handleDeleteSub = (id: string, name: string) => {
    setConfirmDialog({
      open: true,
      title: `Delete "${name}"?`,
      body: 'This subcategory will be permanently removed. Products will be unlinked but not deleted.',
      onConfirm: async () => {
        try {
          setDeleteLoading(id);
          setConfirmDialog((p) => ({ ...p, open: false }));
          await adminService.deleteSubcategory(id);
          toast(`"${name}" deleted`);
          await fetchData();
        } catch (err: any) {
          toast(err.message || 'Delete failed', 'error');
        } finally { setDeleteLoading(null); }
      },
    });
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-pink-100" />
            <div className="absolute inset-0 rounded-full border-4 border-pink-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-800 font-black text-lg">Loading categories</p>
          <p className="text-slate-400 text-sm mt-1">Fetching your store data…</p>
        </div>
      </div>
    );
  }

  const editingSub = editingSubId ? subcategories.find((s) => s.id === editingSubId) : null;
  const editingCatIdx = editingSub ? (categoryIndex.get(editingSub.category_id) ?? 0) : -1;
  const editingCatName = editingSub
    ? (editingSub.categories?.name || categories.find((c) => c.id === editingSub.category_id)?.name || '')
    : '';

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />

      {/* Custom confirm dialog */}
      <AnimatePresence>
        {confirmDialog.open && (
          <ConfirmDialog
            title={confirmDialog.title}
            body={confirmDialog.body}
            loading={deleteLoading !== null}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog((p) => ({ ...p, open: false }))}
          />
        )}
      </AnimatePresence>

      {/* Category create/edit modal */}
      <AnimatePresence>
        {catModal.open && (
          <CategoryModal
            category={catModal.category}
            onClose={() => setCatModal({ open: false, category: null })}
            onSave={(msg) => { toast(msg); fetchData(); }}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="min-h-screen bg-slate-50">

        {/* ── Hero Header ── */}
        <div className="bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 px-6 lg:px-10 pt-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-5 mb-7">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-pink-200 text-xs font-bold uppercase tracking-widest">Store Management</span>
                  <span className="w-1 h-1 rounded-full bg-pink-300/60" />
                  <span className="text-pink-200/80 text-xs font-medium">Categories</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                  Category Architecture
                </h1>
                <p className="text-pink-200 font-medium mt-2 text-sm">
                  {categories.length} {categories.length === 1 ? 'category' : 'categories'} · {subcategories.length} subcategories
                </p>
              </div>
              <motion.button
                onClick={() => setCatModal({ open: true, category: null })}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white text-pink-700 hover:bg-pink-50 px-5 py-3 rounded-2xl font-black text-sm shadow-xl transition-colors shrink-0"
              >
                <Plus size={17} /> Add Category
              </motion.button>
            </div>

            {/* Stats in hero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Categories',    value: categories.length },
                { label: 'Subcategories', value: subcategories.length },
                {
                  label: 'Avg Subs / Cat',
                  value: categories.length ? (subcategories.length / categories.length).toFixed(1) : '0',
                },
                {
                  label: 'Most Subs',
                  value: categories.length
                    ? (categories.reduce(
                        (b, c) => (grouped.get(c.id)?.length || 0) > (grouped.get(b.id)?.length || 0) ? c : b,
                        categories[0],
                      )?.name || '—')
                    : '—',
                },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-xl font-black text-white leading-none truncate">{s.value}</p>
                  <p className="text-pink-200/80 text-[11px] font-bold mt-1 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-7">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* ── Left: Categories list ── */}
            <div className="xl:col-span-3 flex flex-col gap-4">

              {/* Search bar */}
              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories by name or slug…"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold shadow-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X size={13} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Categories card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={14} className="text-pink-500" />
                    <h2 className="font-black text-xs uppercase tracking-widest text-slate-600">
                      {search ? `Results (${filteredCategories.length})` : `All Categories (${categories.length})`}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">
                    Click row to expand · click chip to edit sub
                  </span>
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="text-center py-16 px-8">
                    {search ? (
                      <>
                        <Search size={44} className="mx-auto mb-3 text-slate-200" />
                        <p className="font-black text-slate-700 text-base">No results for "{search}"</p>
                        <button
                          onClick={() => setSearch('')}
                          className="mt-3 text-sm text-pink-600 font-bold hover:underline"
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      <>
                        <FolderOpen size={52} className="mx-auto mb-4 text-slate-200" />
                        <p className="font-black text-slate-700 text-lg">No categories yet</p>
                        <p className="text-slate-400 text-sm mt-1 mb-5">
                          Create your first category to start organising products
                        </p>
                        <button
                          onClick={() => setCatModal({ open: true, category: null })}
                          className="inline-flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
                        >
                          <Plus size={15} /> Add First Category
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filteredCategories.map((c) => {
                      const i = categoryIndex.get(c.id) ?? 0;
                      const p = pal(i);
                      const subs = grouped.get(c.id) || [];
                      const isOpen = expanded.has(c.id);
                      const isDeleting = deleteLoading === c.id;

                      return (
                        <div key={c.id} className="group">
                          {/* Row */}
                          <div
                            className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors relative
                              ${isOpen ? 'bg-slate-50/80' : 'hover:bg-slate-50/60'}`}
                            onClick={() => toggleExpand(c.id)}
                          >
                            {/* Left accent bar */}
                            <div
                              className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all duration-200
                                ${isOpen ? p.accent : 'bg-transparent'}`}
                            />

                            {/* Avatar */}
                            <div className={`w-11 h-11 rounded-2xl shrink-0 overflow-hidden ${p.light} flex items-center justify-center`}>
                              {c.image_url
                                ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                                : <span className={`font-black text-lg ${p.text}`}>{c.name[0]?.toUpperCase()}</span>
                              }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${p.chip}`}>
                                  {subs.length} sub{subs.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                                {c.slug ? `/${c.slug}` : <span className="italic">no slug</span>}
                                {c.description && (
                                  <span className="not-italic font-sans font-medium text-slate-400/80"> · {c.description}</span>
                                )}
                              </p>
                            </div>

                            {/* Hover actions */}
                            <div
                              className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setCatModal({ open: true, category: c })}
                                className="p-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors"
                                title="Edit category"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.id, c.name)}
                                disabled={isDeleting}
                                className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-400 disabled:opacity-40 transition-colors"
                                title="Delete category"
                              >
                                {isDeleting
                                  ? <Loader2 size={13} className="animate-spin text-red-500" />
                                  : <Trash2 size={13} />
                                }
                              </button>
                            </div>

                            <ChevronDown
                              size={14}
                              className={`text-slate-300 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                            />
                          </div>

                          {/* Expanded subcategory chips */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-4 pt-3 border-t border-dashed border-slate-100 bg-slate-50/50 ml-1">
                                  {subs.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-1">
                                      No subcategories — use the panel on the right to add one.
                                    </p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {subs.map((s) => (
                                        <button
                                          key={s.id}
                                          onClick={(e) => { e.stopPropagation(); startEditSub(s); }}
                                          title="Click to edit"
                                          className={`group/chip flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-xl border transition-all
                                            ${editingSubId === s.id
                                              ? 'bg-amber-100 text-amber-700 border-amber-300 ring-1 ring-amber-300'
                                              : `${p.chip} hover:shadow-sm`
                                            }`}
                                        >
                                          <Pencil size={9} className="opacity-0 group-hover/chip:opacity-60 transition-opacity" />
                                          {s.name}
                                        </button>
                                      ))}
                                      {/* Quick-add chip */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSubForm({ name: '', slug: '', category_id: c.id });
                                          setEditingSubId(null);
                                          setSubError('');
                                          setTimeout(() => subNameRef.current?.focus(), 60);
                                        }}
                                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-pink-400 hover:text-pink-600 transition-all"
                                      >
                                        <Plus size={9} /> Add
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Subcategory editor + list ── */}
            <div className="xl:col-span-2 flex flex-col gap-4">

              {/* Subcategory form */}
              <div className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-300
                ${editingSubId ? 'border-amber-300 shadow-amber-100/50' : 'border-slate-100'}`}>

                <div className={`px-5 py-4 border-b flex items-center gap-3 transition-colors duration-300
                  ${editingSubId ? 'bg-linear-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-linear-to-r from-slate-50 to-white border-slate-100'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                    ${editingSubId ? 'bg-amber-100' : 'bg-slate-100'}`}>
                    <Layers size={13} className={editingSubId ? 'text-amber-600' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`font-black text-xs uppercase tracking-widest
                      ${editingSubId ? 'text-amber-700' : 'text-slate-600'}`}>
                      {editingSubId ? 'Editing Subcategory' : 'Add Subcategory'}
                    </h2>
                    {editingSubId && editingCatName && (
                      <p className="text-[10px] text-amber-500/80 font-semibold mt-0.5 truncate">in {editingCatName}</p>
                    )}
                  </div>
                  {editingSubId && (
                    <button
                      onClick={resetSubForm}
                      className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-600 transition-colors shrink-0"
                      title="Cancel editing"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Editing info banner */}
                <AnimatePresence>
                  {editingSubId && editingSub && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-4 mt-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                        {editingCatIdx >= 0 && (
                          <div className={`w-2 h-2 rounded-full shrink-0 ${pal(editingCatIdx).dot}`} />
                        )}
                        <p className="text-xs font-semibold text-amber-800 flex-1 truncate">
                          Editing: <span className="font-black">"{editingSub.name}"</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSaveSub} className="p-4 space-y-3">
                  <AnimatePresence>
                    {subError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-100 px-3 py-2 rounded-xl flex items-center gap-2">
                          <AlertCircle size={12} /> {subError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Parent Category
                    </label>
                    <select
                      value={subForm.category_id}
                      onChange={(e) => setSubForm((p) => ({ ...p, category_id: e.target.value }))}
                      className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-pink-400 bg-slate-50 focus:bg-white transition-all"
                      required
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Subcategory Name
                    </label>
                    <input
                      ref={subNameRef}
                      value={subForm.name}
                      onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Stitched Suits, Palazzo…"
                      className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-pink-400 bg-slate-50 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Slug <span className="normal-case font-medium text-slate-400">(auto-generated if blank)</span>
                    </label>
                    <div className="relative">
                      <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        value={subForm.slug}
                        onChange={(e) => setSubForm((p) => ({ ...p, slug: e.target.value }))}
                        placeholder="stitched-suits"
                        className="w-full border-2 border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:border-pink-400 bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={subSaving}
                      className={`flex-1 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors
                        ${editingSubId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-pink-600 hover:bg-pink-700'}`}
                    >
                      {subSaving ? <Loader2 size={13} className="animate-spin" /> : editingSubId ? <Check size={13} /> : <Plus size={13} />}
                      {editingSubId ? 'Save Changes' : 'Add Subcategory'}
                    </button>
                    {editingSubId && (
                      <button
                        type="button"
                        onClick={resetSubForm}
                        className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Cancel"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Subcategory list */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white flex items-center gap-2">
                  <Tag size={13} className="text-violet-500" />
                  <h2 className="font-black text-xs uppercase tracking-widest text-slate-600">
                    All Subcategories ({subcategories.length})
                  </h2>
                </div>
                <div className="overflow-y-auto max-h-[420px] divide-y divide-slate-50">
                  {subcategories.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <Tag size={36} className="mx-auto mb-3 text-slate-200" />
                      <p className="text-sm font-bold text-slate-600">No subcategories yet</p>
                      <p className="text-xs text-slate-400 mt-1">Add one using the form above</p>
                    </div>
                  ) : (
                    subcategories.map((sub) => {
                      const idx = categoryIndex.get(sub.category_id) ?? 0;
                      const p = pal(idx);
                      const isEditing = editingSubId === sub.id;
                      const isDel = deleteLoading === sub.id;
                      const catName = sub.categories?.name || categories.find((c) => c.id === sub.category_id)?.name || '—';
                      return (
                        <motion.div
                          key={sub.id}
                          layout
                          className={`group flex items-center gap-3 px-4 py-3 transition-colors
                            ${isEditing ? 'bg-amber-50' : 'hover:bg-slate-50/80'}`}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isEditing ? 'text-amber-800' : 'text-slate-800'}`}>
                              {sub.name}
                            </p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border inline-block mt-0.5 ${p.chip}`}>
                              {catName}
                            </span>
                          </div>
                          <div className={`flex gap-1 shrink-0 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button
                              onClick={() => startEditSub(sub)}
                              className={`p-1.5 rounded-lg transition-colors
                                ${isEditing ? 'bg-amber-100 text-amber-600' : 'hover:bg-blue-50 hover:text-blue-600 text-slate-400'}`}
                              title="Edit"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sub.id, sub.name)}
                              disabled={isDel}
                              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 disabled:opacity-40 transition-colors"
                              title="Delete"
                            >
                              {isDel ? <Loader2 size={11} className="animate-spin text-red-500" /> : <Trash2 size={11} />}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
