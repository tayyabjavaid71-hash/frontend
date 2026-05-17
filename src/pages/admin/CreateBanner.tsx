import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createBanner } from '../../services/bannerService';
import { BannerEditor } from '../../components/banners/BannerEditor';
import type { BannerFormData } from '../../types/banner';
import { DEFAULT_BANNER_FORM } from '../../types/banner';

export const CreateBanner: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm]   = useState<BannerFormData>({ ...DEFAULT_BANNER_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desktop_image) {
      setError('Please upload or enter a banner image.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createBanner({
        ...form,
        start_date: form.start_date || undefined,
        end_date:   form.end_date   || undefined,
      } as Parameters<typeof createBanner>[0]);
      navigate('/admin/banners');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/banners" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create Banner</h1>
          <p className="text-sm text-slate-500 mt-0.5">Design a new hero slider banner with live preview</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <BannerEditor form={form} setForm={setForm} error={error} />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-60 transition-colors">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Creating...' : 'Create Banner'}
          </button>
          <Link to="/admin/banners"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
