import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { supabase } from '../../services/supabaseClient';

interface CategoryFormProps {
  category?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('jt-brand-assets')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading image!');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('jt-brand-assets')
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (category?.id) {
        await adminService.updateCategory(category.id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Category Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
              placeholder="Ex: Men, Women, Accessories"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all resize-none"
              placeholder="What defines this category?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Slug (SEO)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
              placeholder="Ex: clothing"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Category Cover Image</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-accent transition-colors group cursor-pointer">
                <input 
                  type="file" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                />
                <Upload className="text-slate-300 group-hover:text-accent mb-2" />
                <span className="text-xs text-slate-400 group-hover:text-accent font-medium">
                  {uploading ? 'Uploading...' : 'Upload cover'}
                </span>
              </div>
              {formData.image_url && (
                <div className="h-24 w-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-primary text-white hover:bg-primary-light transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {category ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
