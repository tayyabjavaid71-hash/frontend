import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BannerFormData, BackgroundType, ContentPosition, AnimationType, DeviceType } from '../../types/banner';
import { ColorPicker }          from './ColorPicker';
import { GradientSelector }     from './GradientSelector';
import { TypographySelector }   from './TypographySelector';
import { MediaUploader }        from './MediaUploader';
import { BannerPreview }        from './BannerPreview';

interface BannerEditorProps {
  form:      BannerFormData;
  setForm:   React.Dispatch<React.SetStateAction<BannerFormData>>;
  error?:    string | null;
}

export const BannerEditor: React.FC<BannerEditorProps> = ({ form, setForm, error }) => {
  const set = <K extends keyof BannerFormData>(k: K, v: BannerFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const setBtn = (i: number, k: keyof BannerFormData['buttons'][0], v: unknown) =>
    setForm(prev => ({
      ...prev,
      buttons: prev.buttons.map((b, idx) => idx === i ? { ...b, [k]: v } : b),
    }));

  const addButton = () =>
    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, {
        id:               `new-${Date.now()}`,
        text:             'Shop Now',
        link:             '/shop',
        style_type:       'primary',
        background_color: '#FBBF24',
        text_color:       '#000000',
        border_radius:    '14px',
        padding:          '16px 30px',
        open_new_tab:     false,
        sort_order:       prev.buttons.length,
      }],
    }));

  const removeButton = (i: number) =>
    setForm(prev => ({ ...prev, buttons: prev.buttons.filter((_, idx) => idx !== i) }));

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* ── Left: Form (3 cols) ─────────────────────────────── */}
      <div className="col-span-3 space-y-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {/* ── 1. Image ──────────────────────────────────────── */}
        <Section title="1. Image">
          <MediaUploader label="Desktop Image" value={form.desktop_image} onChange={v => set('desktop_image', v)} />
          <MediaUploader label="Mobile Image (optional)" value={form.mobile_image} onChange={v => set('mobile_image', v)} />
        </Section>

        {/* ── 2. Content ──────────────────────────────────────── */}
        <Section title="2. Content">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="NEW 2026 COLLECTION"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Subtitle / Brand Label</label>
              <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
          </div>
        </Section>

        {/* ── 3. Background ──────────────────────────────────── */}
        <Section title="3. Background">
          <div className="flex gap-2 mb-3">
            {(['gradient', 'solid', 'image'] as BackgroundType[]).map(t => (
              <button key={t} type="button" onClick={() => set('background_type', t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  form.background_type === t ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {form.background_type === 'gradient' && (
            <GradientSelector
              gradientStart={form.gradient_start}
              gradientEnd={form.gradient_end}
              onChangeStart={v => set('gradient_start', v)}
              onChangeEnd={v => set('gradient_end', v)}
            />
          )}
          {form.background_type === 'solid' && (
            <ColorPicker label="Background Color" value={form.background_color} onChange={v => set('background_color', v)} />
          )}

          <div className="mt-3">
            <ColorPicker label="Overlay Color" value={form.overlay_color} onChange={v => set('overlay_color', v)} />
          </div>
        </Section>

        {/* ── 4. Typography ────────────────────────────────────── */}
        <Section title="4. Typography">
          <TypographySelector
            fontFamily={form.font_family}
            titleSize={form.title_size}
            descriptionSize={form.description_size}
            textColor={form.text_color}
            onFontChange={v     => set('font_family',       v)}
            onTitleSizeChange={v => set('title_size',       v)}
            onDescSizeChange={v  => set('description_size', v)}
            onTextColorChange={v => set('text_color',       v)}
          />
        </Section>

        {/* ── 5. Layout & Animation ──────────────────────────── */}
        <Section title="5. Layout & Animation">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Content Position</label>
              <div className="flex gap-1.5">
                {(['left', 'center', 'right'] as ContentPosition[]).map(p => (
                  <button key={p} type="button" onClick={() => set('content_position', p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize flex-1 transition-colors ${
                      form.content_position === p ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Animation</label>
              <div className="flex gap-1.5">
                {(['slide', 'fade', 'zoom'] as AnimationType[]).map(a => (
                  <button key={a} type="button" onClick={() => set('animation_type', a)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize flex-1 transition-colors ${
                      form.animation_type === a ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── 6. Slider Settings ───────────────────────────────── */}
        <Section title="6. Slider Settings">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Slide Duration (ms)</label>
              <input type="number" min={1000} max={15000} step={500} value={form.slide_duration}
                onChange={e => set('slide_duration', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Sort Order</label>
              <input type="number" min={0} value={form.sort_order}
                onChange={e => set('sort_order', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Auto Slide</label>
              <Toggle value={form.auto_slide} onChange={v => set('auto_slide', v)} />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Active</label>
              <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
            </div>
          </div>
        </Section>

        {/* ── 7. Scheduling & Targeting ─────────────────────────── */}
        <Section title="7. Scheduling & Targeting">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
              <input type="datetime-local" value={form.start_date}
                onChange={e => set('start_date', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
              <input type="datetime-local" value={form.end_date}
                onChange={e => set('end_date', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Device Target</label>
              <select value={form.device_type} onChange={e => set('device_type', e.target.value as DeviceType)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All Devices</option>
                <option value="desktop">Desktop Only</option>
                <option value="mobile">Mobile Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">A/B Variant</label>
              <div className="flex gap-1.5">
                {['A', 'B', 'C'].map(v => (
                  <button key={v} type="button" onClick={() => set('variant', v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-1 transition-colors ${
                      form.variant === v ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── 8. CTA Buttons ────────────────────────────────────── */}
        <Section title="8. CTA Buttons">
          <div className="space-y-3">
            {form.buttons.map((btn, i) => (
              <div key={btn.id ?? i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative">
                <button type="button" onClick={() => removeButton(i)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Text</label>
                    <input required value={btn.text} onChange={e => setBtn(i, 'text', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Link URL</label>
                    <input required value={btn.link} onChange={e => setBtn(i, 'link', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker label="Background" value={btn.background_color ?? '#FBBF24'} onChange={v => setBtn(i, 'background_color', v)} />
                  <ColorPicker label="Text Color"  value={btn.text_color       ?? '#000000'} onChange={v => setBtn(i, 'text_color', v)} />
                  <ColorPicker label="Border"      value={btn.border_color     ?? ''}        onChange={v => setBtn(i, 'border_color', v)} />
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Border Radius</label>
                    <input value={btn.border_radius ?? '14px'} onChange={e => setBtn(i, 'border_radius', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Padding</label>
                    <input value={btn.padding ?? '16px 30px'} onChange={e => setBtn(i, 'padding', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Icon (emoji)</label>
                    <input value={btn.icon ?? ''} onChange={e => setBtn(i, 'icon', e.target.value)}
                      placeholder="🛍️"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <input type="checkbox" checked={btn.open_new_tab} onChange={e => setBtn(i, 'open_new_tab', e.target.checked)} className="rounded" />
                  Open in new tab
                </label>
              </div>
            ))}

            <button type="button" onClick={addButton}
              className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline mt-1">
              <Plus size={14} /> Add Button
            </button>
          </div>
        </Section>
      </div>

      {/* ── Right: Live Preview (2 cols) ────────────────────── */}
      <div className="col-span-2">
        <div className="sticky top-6 space-y-4">
          <h3 className="text-sm font-black text-slate-700">Live Preview</h3>
          <BannerPreview form={form} />
          <div className="text-xs text-slate-400 text-center">Preview updates as you type</div>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
    <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
    {children}
  </div>
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
  </button>
);
