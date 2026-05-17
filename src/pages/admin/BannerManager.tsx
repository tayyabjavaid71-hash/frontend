import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown,
  Loader2, ImageIcon, BarChart2,
} from 'lucide-react';
import {
  getAllBannersAdmin,
  deleteBanner,
  toggleBannerActive,
  reorderBanners,
} from '../../services/bannerService';
import type { Banner } from '../../types/banner';

export const BannerManager: React.FC = () => {
  const [banners, setBanners]   = useState<Banner[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setBanners(await getAllBannersAdmin());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    setDeleting(id);
    try {
      await deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleBannerActive(id, !current);
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b));
  };

  const handleMove = async (index: number, dir: 'up' | 'down') => {
    const next = [...banners];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    const reordered = next.map((b, i) => ({ ...b, sort_order: i }));
    setBanners(reordered);
    await reorderBanners(reordered.map(b => ({ id: b.id, sort_order: b.sort_order })));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Banner Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage hero slider banners — drag to reorder, toggle visibility, edit designs</p>
        </div>
        <Link to="/admin/banners/create"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
          <Plus size={16} /> New Banner
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No banners yet</p>
          <p className="text-sm mt-1">Create your first banner to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Order</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Preview</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Banner</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Type</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Btns</th>
                <th className="text-right px-4 py-3.5 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {banners.map((banner, idx) => (
                <tr key={banner.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"><ArrowUp size={13} /></button>
                      <button onClick={() => handleMove(idx, 'down')} disabled={idx === banners.length - 1}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"><ArrowDown size={13} /></button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-20 h-12 rounded-lg overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${banner.gradient_start ?? '#3b0764'}, ${banner.gradient_end ?? '#7C3AED'})` }}>
                      {banner.desktop_image && (
                        <img src={banner.desktop_image} alt={banner.title} className="w-full h-full object-cover opacity-70" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-[200px]">
                    <p className="font-semibold text-slate-900 truncate">{banner.title}</p>
                    {banner.subtitle && <p className="text-slate-400 text-xs truncate">{banner.subtitle}</p>}
                    <p className="text-slate-300 text-[10px] mt-0.5 font-mono">{banner.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-4">
                    <button onClick={() => handleToggle(banner.id, banner.is_active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        banner.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}>
                      {banner.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                      {banner.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-slate-500 capitalize text-xs">{banner.banner_type ?? 'hero'}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 text-xs">{banner.banner_buttons?.length ?? 0}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/banners/${banner.id}/analytics`}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-500 hover:text-white transition-colors" title="Analytics">
                        <BarChart2 size={15} />
                      </Link>
                      <Link to={`/admin/banners/${banner.id}/edit`}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-primary hover:text-white transition-colors" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(banner.id)} disabled={deleting === banner.id}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50" title="Delete">
                        {deleting === banner.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
