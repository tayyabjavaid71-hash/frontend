import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, RotateCcw, Clock } from "lucide-react";
import {
  getBannerById,
  updateBanner,
  getBannerVersions,
  restoreBannerVersion,
} from "../../services/bannerService";
import { BannerEditor } from "../../components/banners/BannerEditor";
import type { BannerFormData, Banner, BannerVersion } from "../../types/banner";
import { DEFAULT_BANNER_FORM } from "../../types/banner";

function bannerToForm(banner: Banner): BannerFormData {
  return {
    title:            banner.title,
    subtitle:         banner.subtitle          ?? "",
    description:      banner.description       ?? "",
    desktop_image:    banner.desktop_image,
    mobile_image:     banner.mobile_image      ?? "",
    banner_type:      banner.banner_type       ?? "hero",
    background_type:  banner.background_type   ?? "gradient",
    background_color: banner.background_color  ?? "#7C3AED",
    gradient_start:   banner.gradient_start    ?? "#3b0764",
    gradient_end:     banner.gradient_end      ?? "#7C3AED",
    overlay_enabled:  banner.overlay_enabled,
    overlay_color:    banner.overlay_color     ?? "#3b0764",
    text_color:       banner.text_color        ?? "#ffffff",
    font_family:      banner.font_family       ?? "Inter",
    title_size:       banner.title_size        ?? "64px",
    description_size: banner.description_size  ?? "20px",
    content_position: banner.content_position  ?? "left",
    auto_slide:       banner.auto_slide,
    slide_duration:   banner.slide_duration,
    animation_type:   banner.animation_type    ?? "slide",
    is_active:        banner.is_active,
    sort_order:       banner.sort_order,
    start_date:       banner.start_date
      ? new Date(banner.start_date).toISOString().slice(0, 16)
      : "",
    end_date:         banner.end_date
      ? new Date(banner.end_date).toISOString().slice(0, 16)
      : "",
    device_type:      banner.device_type   ?? "all",
    country_code:     banner.country_code  ?? "",
    variant:          banner.variant       ?? "A",
    buttons: (banner.banner_buttons ?? []).map(b => ({
      id:               b.id,
      text:             b.text,
      link:             b.link,
      style_type:       b.style_type,
      background_color: b.background_color  ?? "#FBBF24",
      text_color:       b.text_color        ?? "#000000",
      border_color:     b.border_color,
      border_radius:    b.border_radius     ?? "14px",
      padding:          b.padding           ?? "16px 30px",
      shadow_style:     b.shadow_style,
      hover_background: b.hover_background,
      hover_color:      b.hover_color,
      icon:             b.icon,
      open_new_tab:     b.open_new_tab,
      sort_order:       b.sort_order,
    })),
  };
}

export const EditBanner: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  const [form, setForm]          = useState<BannerFormData>({ ...DEFAULT_BANNER_FORM });
  const [loading, setLoading]    = useState(true);
  const [saving, setSaving]      = useState(false);
  const [error, setError]        = useState<string | null>(null);
  const [versions, setVersions]  = useState<BannerVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const banner = await getBannerById(id);
        setForm(bannerToForm(banner));
        const vList = await getBannerVersions(id);
        setVersions(vList);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load banner");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateBanner(id, {
        ...form,
        start_date: form.start_date || undefined,
        end_date:   form.end_date   || undefined,
        buttons:    form.buttons,
      });
      navigate("/admin/banners");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!id) return;
    if (!window.confirm("Restore this version? Current state will be saved as a new version.")) return;
    setRestoring(versionId);
    try {
      const restored = await restoreBannerVersion(id, versionId);
      setForm(bannerToForm(restored));
      setShowHistory(false);
      // Refresh versions
      const vList = await getBannerVersions(id);
      setVersions(vList);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-primary w-8 h-8" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/banners" className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Edit Banner</h1>
            <p className="text-sm text-slate-500 mt-0.5">Update design, content, and settings</p>
          </div>
        </div>
        {versions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Clock size={15} />
            Version History ({versions.length})
          </button>
        )}
      </div>

      {/* Version history panel */}
      {showHistory && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <RotateCcw size={16} /> Previous Versions
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {versions.map(v => (
              <div key={v.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {(v.previous_data as { title?: string }).title ?? "Untitled"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(v.created_at).toLocaleString()}
                    {v.changed_by && ` — ${v.changed_by}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestore(v.id)}
                  disabled={restoring === v.id}
                  className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 disabled:opacity-50"
                >
                  {restoring === v.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <RotateCcw size={12} />}
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <BannerEditor form={form} setForm={setForm} error={error} />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-60 transition-colors">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
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
