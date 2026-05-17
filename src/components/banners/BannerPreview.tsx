import React from 'react';
import type { BannerFormData } from '../../types/banner';

interface BannerPreviewProps {
  form: BannerFormData;
}

export const BannerPreview: React.FC<BannerPreviewProps> = ({ form }) => {
  const bg =
    form.background_type === 'solid'
      ? { backgroundColor: form.background_color || form.gradient_start }
      : form.background_type === 'image' && form.desktop_image
      ? { backgroundImage: `url(${form.desktop_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: `linear-gradient(135deg, ${form.gradient_start}, ${form.gradient_end})` };

  const textAlign =
    form.content_position === 'center' ? 'center' :
    form.content_position === 'right'  ? 'right'  : 'left';

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden shadow-xl"
      style={{ height: 280, ...bg }}
    >
      {/* Product image */}
      {form.desktop_image && form.background_type !== 'image' && (
        <div className="absolute inset-y-0 right-0 w-[55%] overflow-hidden">
          <img src={form.desktop_image} alt="preview" className="w-full h-full object-cover object-top" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to right, ${form.gradient_start} 0%, ${form.gradient_start}cc 15%, transparent 50%)` }}
          />
        </div>
      )}

      {/* Text */}
      <div
        className="relative z-10 flex flex-col justify-center h-full px-8"
        style={{ textAlign, alignItems: form.content_position === 'center' ? 'center' : form.content_position === 'right' ? 'flex-end' : 'flex-start' }}
      >
        {form.subtitle && (
          <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2"
             style={{ color: form.text_color, fontFamily: form.font_family }}>
            {form.subtitle}
          </p>
        )}
        <h2
          className="font-black leading-tight whitespace-pre-line"
          style={{
            color:      form.text_color,
            fontFamily: form.font_family,
            fontSize:   `clamp(18px, 3vw, ${form.title_size})`,
          }}
        >
          {form.title || 'Banner Title'}
        </h2>
        {form.description && (
          <p className="mt-2 opacity-80 max-w-[200px]"
             style={{ color: form.text_color, fontFamily: form.font_family, fontSize: `clamp(11px, 1vw, ${form.description_size})` }}>
            {form.description}
          </p>
        )}

        {/* Buttons preview */}
        <div className="flex flex-wrap gap-2 mt-4">
          {form.buttons.map((btn, i) => (
            <span
              key={i}
              className="inline-block font-bold text-xs shadow"
              style={{
                backgroundColor: btn.background_color ?? '#FBBF24',
                color:           btn.text_color       ?? '#000',
                borderRadius:    btn.border_radius     ?? '10px',
                padding:         '8px 18px',
              }}
            >
              {btn.text}
            </span>
          ))}
        </div>
      </div>

      {/* Live badge */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
          form.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
        }`}>
          {form.is_active ? 'Active' : 'Draft'}
        </span>
      </div>
    </div>
  );
};
