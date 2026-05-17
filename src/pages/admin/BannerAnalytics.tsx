import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp, MousePointerClick, Eye } from 'lucide-react';
import { getBannerAnalytics, getBannerById } from '../../services/bannerService';
import type { Banner } from '../../types/banner';

interface AnalyticsData {
  impressions: number;
  clicks: number;
  ctr: number;
  raw: Array<{
    id: string;
    event_type: string;
    device_type?: string;
    country_code?: string;
    created_at: string;
  }>;
}

export const BannerAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [banner, setBanner]     = useState<Banner | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [b, a] = await Promise.all([getBannerById(id), getBannerAnalytics(id)]);
        setBanner(b);
        setAnalytics(a as unknown as AnalyticsData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-primary w-8 h-8" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/banners" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Banner Analytics</h1>
          {banner && <p className="text-sm text-slate-500 mt-0.5">{banner.title}</p>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {analytics && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-xl"><Eye size={18} className="text-purple-600" /></div>
                <span className="text-sm font-semibold text-slate-500">Impressions</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{analytics.impressions.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-xl"><MousePointerClick size={18} className="text-blue-600" /></div>
                <span className="text-sm font-semibold text-slate-500">Clicks</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{analytics.clicks.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-xl"><TrendingUp size={18} className="text-green-600" /></div>
                <span className="text-sm font-semibold text-slate-500">Click-Through Rate</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{analytics.ctr.toFixed(1)}%</p>
            </div>
          </div>

          {/* Recent events table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Recent Events</h2>
              <p className="text-xs text-slate-400 mt-0.5">{analytics.raw.length} events</p>
            </div>
            {analytics.raw.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm">No events recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Event</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Device</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {analytics.raw.slice(0, 100).map(evt => (
                      <tr key={evt.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(evt.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            evt.event_type === 'click'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {evt.event_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 capitalize">{evt.device_type ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{evt.country_code ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
