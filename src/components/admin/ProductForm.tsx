import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Trash2, ImagePlus, Star } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { supabase } from '../../services/supabaseClient';
import { productService } from '../../services/productService';
import type { ProductVariation } from '../../services/productService';
import { API } from '../../services/api';

interface ProductFormProps {
  product?: Record<string, unknown>;
  onClose: () => void;
  onSuccess: () => void;
}

interface VariationRow {
  id?: string;
  color: string;
  size: string;
  stock: number;
  price_adjustment: number;
  image_url?: string;
  isNew?: boolean;
}

const SRS_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: (product?.title as string) || '',
    slug: (product?.slug as string) || '',
    price: (product?.price as number) || 0,
    discount_price: (product?.discount_price as number) || 0,
    old_price: (product?.old_price as number) || 0,
    stock: (product?.stock as number) || 0,
    category_id: (product?.category_id as string) || '',
    subcategory_id: (product?.subcategory_id as string) || '',
    description: (product?.description as string) || '',
    image_url: (product?.image_url as string) || '',
    sizes: Array.isArray(product?.sizes) ? (product.sizes as string[]).join(', ') : '',
    colors: Array.isArray(product?.colors) ? (product.colors as string[]).join(', ') : '',
    fabric: (product?.fabric as string) || '',
    work: (product?.work as string) || '',
    pieces: (product?.pieces as number) || 1,
    includes: Array.isArray(product?.includes) ? (product.includes as string[]).join(', ') : '',
    care_instructions: (product?.care_instructions as string) || '',
    is_new_arrival: Boolean(product?.is_new_arrival),
    is_on_sale: Boolean(product?.is_on_sale),
  });

  const [categories, setCategories] = useState<Array<{id: string; name: string}>>([]);
  const [subcategories, setSubcategories] = useState<Array<{id: string; name: string; category_id: string}>>([]);
  const [uploading, setUploading] = useState(false);
  const [, setUploadProgress] = useState<Record<string, 'uploading' | 'done' | 'error'>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [variations, setVariations] = useState<VariationRow[]>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'variations'>('details');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // images as an array in state, synced to formData.images (csv) only on submit
  const [imageList, setImageList] = useState<string[]>(() => {
    const initial = Array.isArray(product?.images)
      ? (product.images as string[]).filter(Boolean)
      : (product?.images as string || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    if (product?.image_url && !initial.includes(product.image_url as string)) {
      initial.unshift(product.image_url as string);
    }
    return initial;
  });

  useEffect(() => {
    Promise.all([adminService.fetchCategories(), adminService.fetchSubcategories()]).then(([cats, subs]) => {
      setCategories(cats || []);
      setSubcategories(subs || []);
    });

    // Load existing variations when editing
    if (product?.id) {
      setLoadingVariations(true);
      productService.fetchVariations(product.id as string).then((vars: ProductVariation[]) => {
        setVariations(vars.map(v => ({
          id: v.id, color: v.color, size: v.size, stock: v.stock, price_adjustment: v.price_adjustment, image_url: v.image_url || '',
        })));
      }).finally(() => setLoadingVariations(false));
    }
  }, [product?.id]);

  const visibleSubcategories = subcategories.filter(s => s.category_id === formData.category_id);

  // ── Upload a single file, return its public URL ──────────────────────────
  const uploadSingleFile = useCallback(async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const tempId = file.name + Date.now();
    setUploadProgress(p => ({ ...p, [tempId]: 'uploading' }));
    try {
      const { data } = await API.post('/admin/upload-url', { path: filePath, contentType: file.type });
      const uploadRes = await fetch(data.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
      setUploadProgress(p => ({ ...p, [tempId]: 'done' }));
      setTimeout(() => setUploadProgress(p => { const n = {...p}; delete n[tempId]; return n; }), 1500);
      return data.publicUrl as string;
    } catch (err: any) {
      setUploadProgress(p => ({ ...p, [tempId]: 'error' }));
      setTimeout(() => setUploadProgress(p => { const n = {...p}; delete n[tempId]; return n; }), 3000);
      console.error('Upload error:', err.message);
      return null;
    }
  }, []);

  // ── Handle file input change ─────────────────────────────────────────────
  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    setUploading(true);
    const results = await Promise.all(arr.map(uploadSingleFile));
    const urls = results.filter((u): u is string => u !== null);
    setImageList(prev => {
      const merged = [...prev, ...urls.filter(u => !prev.includes(u))];
      return merged;
    });
    setUploading(false);
  }, [uploadSingleFile]);

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFilesSelected(e.target.files);
    e.target.value = '';
  };

  // ── Drag-and-drop ────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFilesSelected(e.dataTransfer.files);
  };

  // ── Remove image (removes from UI and deletes from Supabase Storage) ────
  const removeImage = useCallback(async (url: string) => {
    // Optimistically remove from UI immediately
    setImageList(prev => prev.filter(u => u !== url));
    if (formData.image_url === url) {
      setFormData(p => ({ ...p, image_url: '' }));
    }
    // Only delete from storage if it's a Supabase-hosted URL
    if (url.includes('supabase.co/storage')) {
      try {
        await API.delete('/admin/images', { data: { url } });
      } catch (err) {
        // Non-fatal: file may already be gone or URL may be external
        console.warn('[ProductForm] Storage delete failed (non-fatal):', err);
      }
    }
  }, [formData.image_url]);

  // ── Set as main/cover image ──────────────────────────────────────────────
  const setMainImage = (url: string) => {
    setFormData(p => ({ ...p, image_url: url }));
    setImageList(prev => [url, ...prev.filter(u => u !== url)]);
  };

  const addVariationRow = () => {
    setVariations(prev => [...prev, { color: '', size: 'M', stock: 0, price_adjustment: 0, image_url: '', isNew: true }]);
  };

  const removeVariationRow = async (index: number) => {
    const v = variations[index];
    if (v.id) {
      await productService.deleteVariation(v.id);
    }
    setVariations(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariationRow = (index: number, field: keyof VariationRow, value: string | number) => {
    setVariations(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        // Sanitize UUID fields — empty string fails FK constraints
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        // Use imageList as the canonical source for all images
        image_url: imageList[0] || formData.image_url || '',
        images: imageList,
        sizes: formData.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map((c: string) => c.trim()).filter(Boolean),
        includes: formData.includes.split(',').map((i: string) => i.trim()).filter(Boolean),
      };

      let productId = product?.id as string | undefined;

      if (productId) {
        await adminService.updateProduct(productId, payload);
      } else {
        const newProduct = await adminService.createProduct(payload);
        productId = newProduct?.id;
      }

      // Save variations: insert new ones
      if (productId) {
        const newVars = variations.filter(v => v.isNew && v.color && v.size);
        for (const v of newVars) {
          await productService.addVariation(productId, {
            color: v.color, size: v.size, stock: v.stock, price_adjustment: v.price_adjustment, image_url: v.image_url || undefined,
          });
        }
        // Update existing variations' stock, price, color, size, image_url
        const existingVars = variations.filter(v => v.id && !v.isNew);
        for (const v of existingVars) {
          await supabase.from('product_variations').update({
            stock: v.stock, price_adjustment: v.price_adjustment, color: v.color, size: v.size, image_url: v.image_url || null,
          }).eq('id', v.id!);
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Error saving product';
      setSaveError(msg);
      console.error('[ProductForm] save error:', err?.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{product ? 'Update Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['details', 'variations'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 font-black text-xs uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'details' ? '📦 Product Details' : `🎨 Variations (${variations.length})`}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* ── DETAILS TAB ──────────────────────────────────────── */}
          {activeTab === 'details' && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Title *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                    placeholder="Ex: JT Premium 3-Piece Luxury Set" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slug</label>
                  <input type="text" value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                    placeholder="embroidered-lawn-shalwar-kameez" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category *</label>
                  <select required value={formData.category_id} onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Stock (total)</label>
                  <input type="number" min="0" value={formData.stock} onChange={e => setFormData(p => ({ ...p, stock: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subcategory</label>
                  <select value={formData.subcategory_id} onChange={e => setFormData(p => ({ ...p, subcategory_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold">
                    <option value="">Select Subcategory</option>
                    {visibleSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Price (PKR) *</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold text-primary" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Original Price / Old Price (PKR)</label>
                  <input type="number" min="0" value={formData.old_price} onChange={e => setFormData(p => ({ ...p, old_price: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold text-slate-400"
                    placeholder="For showing strikethrough discount" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount Price (PKR)</label>
                  <input type="number" min="0" value={formData.discount_price} onChange={e => setFormData(p => ({ ...p, discount_price: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sizes (comma separated)</label>
                  <input type="text" value={formData.sizes} onChange={e => setFormData(p => ({ ...p, sizes: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                    placeholder="XS, S, M, L, XL, XXL" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Colors (comma separated)</label>
                  <input type="text" value={formData.colors} onChange={e => setFormData(p => ({ ...p, colors: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                    placeholder="Black, White, Beige, Maroon" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fabric</label>
                  <input type="text" value={formData.fabric} onChange={e => setFormData(p => ({ ...p, fabric: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                    placeholder="Lawn" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Work</label>
                  <input type="text" value={formData.work} onChange={e => setFormData(p => ({ ...p, work: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                    placeholder="Embroidery" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pieces</label>
                  <input type="number" min="1" value={formData.pieces} onChange={e => setFormData(p => ({ ...p, pieces: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Includes (comma separated)</label>
                  <input type="text" value={formData.includes} onChange={e => setFormData(p => ({ ...p, includes: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all font-bold"
                    placeholder="Shirt, Shalwar, Dupatta" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Care Instructions</label>
                  <textarea rows={2} value={formData.care_instructions} onChange={e => setFormData(p => ({ ...p, care_instructions: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all resize-none font-medium"
                    placeholder="Hand wash only. Do not bleach." />
                </div>

              {/* ── Image Upload ─────────────────────────────────────── */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Images</label>
                  <span className="text-[10px] text-slate-400">{imageList.length} image{imageList.length !== 1 ? 's' : ''} · First image = cover</span>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageInputChange}
                    className="hidden"
                  />
                  <ImagePlus className={`mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-slate-300'}`} size={32} />
                  <p className="text-sm font-black text-slate-500">
                    {uploading ? '⏳ Uploading...' : isDragging ? '📂 Drop to upload' : 'Click or drag images here'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP — multiple files supported</p>

                  {/* Uploading spinner overlay */}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image grid preview */}
                {imageList.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                    {imageList.map((url, idx) => (
                      <div key={url} className="relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all shadow-sm"
                        style={{ borderColor: formData.image_url === url || idx === 0 ? 'var(--color-primary, #b8860b)' : '#e2e8f0' }}>
                        <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />

                        {/* Cover badge */}
                        {(formData.image_url === url || (idx === 0 && !formData.image_url)) && (
                          <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Cover
                          </div>
                        )}

                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {idx !== 0 && (
                            <button type="button" onClick={() => setMainImage(url)}
                              className="p-1.5 bg-amber-400 rounded-full text-white hover:bg-amber-500 transition-colors" title="Set as cover">
                              <Star size={12} />
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(url)}
                            className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors" title="Remove">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 p-3 border border-slate-100 rounded-xl bg-slate-50 text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={formData.is_new_arrival} onChange={e => setFormData(p => ({ ...p, is_new_arrival: e.target.checked }))} />
                    Mark as New Arrival
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-100 rounded-xl bg-slate-50 text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={formData.is_on_sale} onChange={e => setFormData(p => ({ ...p, is_on_sale: e.target.checked }))} />
                    Mark as On Sale
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all resize-none font-medium"
                  placeholder="Tell us about the craftsmanship, fabric, season..." />
              </div>
            </div>
          )}

          {/* ── VARIATIONS TAB ──────────────────────────────────── */}
          {activeTab === 'variations' && (
            <div className="p-8">
              <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-xs font-bold text-amber-700">
                  💡 <strong>SRS Price Logic:</strong> Final Price = Base Price (PKR {formData.price}) + Size Adjustment - Discount
                </p>
              </div>

              {loadingVariations ? (
                <div className="text-center py-8 text-slate-400">Loading variations...</div>
              ) : (
                <>
                  {variations.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      <div className="grid grid-cols-[1fr_80px_80px_80px_64px_32px] gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        <span>Color</span><span>Size</span><span>Stock</span><span>+Price</span><span>Image</span><span></span>
                      </div>
                      {variations.map((v, i) => (
                        <div key={i} className="grid grid-cols-[1fr_80px_80px_80px_64px_32px] gap-2 items-center bg-slate-50 p-3 rounded-xl">
                          <input type="text" placeholder="Black" value={v.color} onChange={e => updateVariationRow(i, 'color', e.target.value)}
                            className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-primary" />
                          <select value={v.size} onChange={e => updateVariationRow(i, 'size', e.target.value)}
                            className="bg-white border border-slate-100 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:border-primary">
                            {SRS_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input type="number" min="0" placeholder="10" value={v.stock} onChange={e => updateVariationRow(i, 'stock', Number(e.target.value))}
                            className="bg-white border border-slate-100 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:border-primary" />
                          <input type="number" placeholder="0" value={v.price_adjustment} onChange={e => updateVariationRow(i, 'price_adjustment', Number(e.target.value))}
                            className="bg-white border border-slate-100 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:border-amber-400" />

                          {/* Per-variant image upload */}
                          <div className="relative w-14 h-14">
                            {v.image_url ? (
                              <div className="group relative w-full h-full rounded-lg overflow-hidden border-2 border-primary/30">
                                <img src={v.image_url} alt={v.color} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => updateVariationRow(i, 'image_url', '')}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
                                  title="Remove variant image"
                                >
                                  <X size={14} className="text-white" />
                                </button>
                              </div>
                            ) : (
                              <label
                                className="w-full h-full flex items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                                title="Upload variant image"
                              >
                                <ImagePlus size={16} className="text-slate-300 hover:text-primary" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = await uploadSingleFile(file);
                                    if (url) updateVariationRow(i, 'image_url', url);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          <button type="button" onClick={() => removeVariationRow(i)} className="flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl mb-6">
                      <p className="font-bold mb-2">No variations yet</p>
                      <p className="text-xs">Add color + size combinations. Each can have its own image, stock, and price.</p>
                    </div>
                  )}

                  <button type="button" onClick={addVariationRow}
                    className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 flex items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all font-black text-xs uppercase tracking-widest">
                    <Plus size={16} /> Add Variation
                  </button>
                </>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="px-8 pb-8 pt-4 border-t border-slate-50">
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
                ⚠️ {saveError}
              </div>
            )}
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={uploading || saving}
                className="flex-2 py-4 px-6 rounded-2xl font-bold bg-primary text-white hover:bg-primary-light transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                {saving ? 'Saving…' : product ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
