import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { supabase } from '../../services/supabaseClient';
import { productService } from '../../services/productService';
import type { ProductVariation } from '../../services/productService';

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
    images: Array.isArray(product?.images) ? (product.images as string[]).join(', ') : '',
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
  const [variations, setVariations] = useState<VariationRow[]>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'variations'>('details');

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
          id: v.id, color: v.color, size: v.size, stock: v.stock, price_adjustment: v.price_adjustment,
        })));
      }).finally(() => setLoadingVariations(false));
    }
  }, [product?.id]);

  const visibleSubcategories = subcategories.filter(s => s.category_id === formData.category_id);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `products/${Math.random()}.${fileExt}`;
    try {
      const { error: uploadError } = await supabase.storage.from('jt-brand-assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('jt-brand-assets').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch { alert('Error uploading image!'); }
    finally { setUploading(false); }
  };

  const addVariationRow = () => {
    setVariations(prev => [...prev, { color: '', size: 'M', stock: 0, price_adjustment: 0, isNew: true }]);
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
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        images: formData.images.split(',').map((img: string) => img.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map((c: string) => c.trim()).filter(Boolean),
        includes: formData.includes.split(',').map((i: string) => i.trim()).filter(Boolean),
      };

      let productId = product?.id as string | undefined;

      if (productId) {
        await adminService.updateProduct(productId, payload);
      } else {
        const { data } = await supabase.from('products').insert([payload]).select().single();
        productId = data?.id;
      }

      // Save variations: insert new ones
      if (productId) {
        const newVars = variations.filter(v => v.isNew && v.color && v.size);
        for (const v of newVars) {
          await productService.addVariation(productId, {
            color: v.color, size: v.size, stock: v.stock, price_adjustment: v.price_adjustment,
          });
        }
        // Update existing variations' stock
        const existingVars = variations.filter(v => v.id && !v.isNew);
        for (const v of existingVars) {
          await supabase.from('product_variations').update({ stock: v.stock, price_adjustment: v.price_adjustment, color: v.color, size: v.size }).eq('id', v.id!);
        }
      }

      onSuccess();
      onClose();
    } catch { alert('Error saving product'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
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

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gallery Images (comma separated URLs)</label>
                  <textarea rows={2} value={formData.images} onChange={e => setFormData(p => ({ ...p, images: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all resize-none font-medium"
                    placeholder="https://...img1.jpg, https://...img2.jpg" />
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

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Image</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-primary/50 transition-colors group cursor-pointer bg-slate-50">
                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    <Upload className="text-slate-300 group-hover:text-primary mb-2" />
                    <span className="text-[10px] text-slate-400 group-hover:text-primary font-black uppercase tracking-widest">
                      {uploading ? 'Uploading...' : 'Click to upload'}
                    </span>
                  </div>
                  {formData.image_url && (
                    <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
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
                      <div className="grid grid-cols-5 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        <span>Color</span><span>Size</span><span>Stock</span><span>+Price</span><span></span>
                      </div>
                      {variations.map((v, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 items-center bg-slate-50 p-3 rounded-xl">
                          <input type="text" placeholder="Black" value={v.color} onChange={e => updateVariationRow(i, 'color', e.target.value)}
                            className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-primary" />
                          <select value={v.size} onChange={e => updateVariationRow(i, 'size', e.target.value)}
                            className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-primary">
                            {SRS_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input type="number" min="0" placeholder="10" value={v.stock} onChange={e => updateVariationRow(i, 'stock', Number(e.target.value))}
                            className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-primary" />
                          <input type="number" placeholder="300" value={v.price_adjustment} onChange={e => updateVariationRow(i, 'price_adjustment', Number(e.target.value))}
                            className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-400" />
                          <button type="button" onClick={() => removeVariationRow(i)} className="flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl mb-6">
                      <p className="font-bold mb-2">No variations yet</p>
                      <p className="text-xs">Add color + size combinations with stock per variation</p>
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
          <div className="px-8 pb-8 pt-4 flex gap-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={uploading}
              className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-primary text-white hover:bg-primary-light transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
              {product ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
