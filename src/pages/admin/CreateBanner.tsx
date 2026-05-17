import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { createBanner, uploadBannerImage, addBannerButton } from '../../services/bannerService';
import type { BannerButton } from '../../types/banner';

type NewButton = Omit<BannerButton, 'id' | 'banner_id'>;

const defaultButton = (): NewButton => ({
  text:             'Shop Now',
  link:             '/shop',
  style_type:       'primary',
  background_color: '#FBBF24',
  text_color:       '#000000',
  border_color:     undefined,
  open_new_tab:     false,
  sort_order:       0,
});

export const CreateBanner: React.FC = () => {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title:           '',
    subtitle:        '',
    description:     '',
    desktop_image:   '',
    mobile_image:    '',
    overlay_enabled: true,
    overlay_color:   '#3b0764',
    is_active:       true,
    sort_order:      0,
    slide_duration:  4500,
    start_date:      '',
    end_date:        '',
  });

  const [buttons, setButtons]   = useState<NewButton[]>([defaultButton()]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError]           = useState<string | null>(null);

  const set = (k: keyof typeof form, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadBannerImage(file);
      set('desktop_image', url);
      setPreviewUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addButton = () =>
    setButtons(prev => [...prev, { ...defaultButton(), sort_order: prev.length }]);

  const removeButton = (i: number) =>
    setButtons(prev => prev.filter((_, idx) => idx !== i));

  const setBtn = (i: number, k: keyof NewButton, v: unknown) =>
    setButtons(prev => prev.map((b, idx) => idx === i ? { ...b, [k]: v } : b));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desktop_image) { setError('Please upload a banner image first.'); return; }
    setSaving(true);
    setError(null);
    try {
      const banner = await createBanner({
        ...form,
        start_date: form.start_date || undefined,
        end_date:   form.end_date   || undefined,
      });
      // Save buttons
      await Promise.all(
        buttons.map((b, i) =>
          addBannerButton({ ...b, banner_id: banner.id, sort_order: i })
        )
      );
      navigate('/admin/banners');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/banners" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create Banner</h1>
          <p className="text-sm text-slate-500 mt-0.5">Add a new hero slider banner</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900">Banner Image</h2>
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
            ) : (
              <div className="space-y-2 text-slate-400">
                {uploading
                  ? <Loader2 className="animate-spin w-10 h-10 mx-auto text-primary" />
                  : <ImageIcon className="w-10 h-10 mx-auto" />
                }
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs">PNG, JPG, WebP up to 5 MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {previewUrl && (
            <button
              type="button"
              onClick={() => { set('desktop_image', ''); setPreviewUrl(''); }}
              className="text-xs text-red-500 hover:underline flex items-center gap-1"
            >
              <Trash2 size={12} /> Remove image
            </button>
          )}
          {/* Or paste URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Or paste image URL</label>
            <input
              type="url"
              value={form.desktop_image}
              onChange={e => { set('desktop_image', e.target.value); setPreviewUrl(e.target.value); }}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Banner Details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900">Banner Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="NEW 2026 COLLECTION"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Subtitle / Brand Label</label>
              <input
                value={form.subtitle}
                onChange={e => set('subtitle', e.target.value)}
                placeholder="JT Collections — Premium Fashion"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={2}
                placeholder="Short product description..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Overlay + Timing */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900">Display Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Overlay Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.overlay_color}
                  onChange={e => set('overlay_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={form.overlay_color}
                  onChange={e => set('overlay_color', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Slide Duration (ms)</label>
              <input
                type="number"
                min={1000}
                max={15000}
                step={500}
                value={form.slide_duration}
                onChange={e => set('slide_duration', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Sort Order</label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={e => set('sort_order', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <label className="text-xs font-semibold text-slate-500">Active</label>
              <button
                type="button"
                onClick={() => set('is_active', !form.is_active)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.is_active ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.is_active ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date (optional)</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={e => set('start_date', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">End Date (optional)</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={e => set('end_date', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">CTA Buttons</h2>
            <button
              type="button"
              onClick={addButton}
              className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline"
            >
              <Plus size={14} /> Add Button
            </button>
          </div>

          {buttons.map((btn, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
              <button
                type="button"
                onClick={() => removeButton(i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Button Text</label>
                <input
                  required
                  value={btn.text}
                  onChange={e => setBtn(i, 'text', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Link URL</label>
                <input
                  required
                  value={btn.link}
                  onChange={e => setBtn(i, 'link', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Background</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={btn.background_color ?? '#FBBF24'} onChange={e => setBtn(i, 'background_color', e.target.value)} className="w-8 h-8 rounded border p-0.5 cursor-pointer" />
                  <input type="text"  value={btn.background_color ?? ''} onChange={e => setBtn(i, 'background_color', e.target.value)} className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Text Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={btn.text_color ?? '#000000'} onChange={e => setBtn(i, 'text_color', e.target.value)} className="w-8 h-8 rounded border p-0.5 cursor-pointer" />
                  <input type="text"  value={btn.text_color ?? ''} onChange={e => setBtn(i, 'text_color', e.target.value)} className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input type="checkbox" id={`newtab-${i}`} checked={btn.open_new_tab} onChange={e => setBtn(i, 'open_new_tab', e.target.checked)} className="rounded" />
                <label htmlFor={`newtab-${i}`} className="text-xs font-semibold text-slate-500">Open in new tab</label>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? 'Saving...' : 'Create Banner'}
          </button>
          <Link to="/admin/banners" className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
