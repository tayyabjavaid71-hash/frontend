import React from 'react';

const FONT_OPTIONS = [
  'Inter', 'Poppins', 'Montserrat', 'Playfair Display',
  'Oswald', 'Raleway', 'Nunito', 'Roboto', 'Open Sans',
];

const SIZE_OPTIONS = [
  '32px', '40px', '48px', '56px', '64px', '72px', '80px', '96px',
];

const DESC_SIZE_OPTIONS = [
  '14px', '16px', '18px', '20px', '22px', '24px',
];

interface TypographySelectorProps {
  fontFamily:      string;
  titleSize:       string;
  descriptionSize: string;
  textColor:       string;
  onFontChange:    (v: string) => void;
  onTitleSizeChange: (v: string) => void;
  onDescSizeChange:  (v: string) => void;
  onTextColorChange: (v: string) => void;
}

export const TypographySelector: React.FC<TypographySelectorProps> = ({
  fontFamily, titleSize, descriptionSize, textColor,
  onFontChange, onTitleSizeChange, onDescSizeChange, onTextColorChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className="p-4 rounded-xl bg-slate-800 text-center"
        style={{ fontFamily }}
      >
        <p style={{ color: textColor, fontSize: titleSize, fontWeight: 900, lineHeight: 1.1 }}>
          PREVIEW TITLE
        </p>
        <p style={{ color: textColor, fontSize: descriptionSize, opacity: 0.8, marginTop: 8 }}>
          Preview description text here
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Font Family */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Font Family</label>
          <select
            value={fontFamily}
            onChange={e => onFontChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ fontFamily }}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
        </div>

        {/* Title size */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Title Size</label>
          <div className="flex gap-1.5 flex-wrap">
            {SIZE_OPTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onTitleSizeChange(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  titleSize === s
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Description size */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Desc Size</label>
          <div className="flex gap-1.5 flex-wrap">
            {DESC_SIZE_OPTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onDescSizeChange(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  descriptionSize === s
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Text color */}
        <div className="col-span-2 flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Text Color</label>
          <div className="flex gap-2 items-center flex-1">
            <input
              type="color"
              value={textColor}
              onChange={e => onTextColorChange(e.target.value)}
              className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-1"
            />
            <input
              type="text"
              value={textColor}
              onChange={e => onTextColorChange(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none"
            />
            <button type="button" onClick={() => onTextColorChange('#ffffff')} className="px-2 py-1.5 bg-slate-800 text-white text-xs rounded-lg">White</button>
            <button type="button" onClick={() => onTextColorChange('#000000')} className="px-2 py-1.5 bg-white border border-slate-200 text-xs rounded-lg">Black</button>
          </div>
        </div>
      </div>
    </div>
  );
};
