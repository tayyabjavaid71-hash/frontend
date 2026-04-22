import React from 'react';
import { motion } from 'framer-motion';

// ── Color name → CSS hex mapping ─────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  black:     '#000000',
  white:     '#ffffff',
  red:       '#ef4444',
  blue:      '#3b82f6',
  navy:      '#1e3a5f',
  green:     '#22c55e',
  pink:      '#ec4899',
  beige:     '#d4b896',
  maroon:    '#800000',
  gold:      '#b8860b',
  yellow:    '#eab308',
  purple:    '#a855f7',
  violet:    '#7c3aed',
  orange:    '#f97316',
  grey:      '#94a3b8',
  gray:      '#94a3b8',
  brown:     '#92400e',
  cream:     '#fef9c3',
  off_white: '#f8f5f0',
  mint:      '#6ee7b7',
  teal:      '#14b8a6',
  peach:     '#fdba74',
  lavender:  '#c4b5fd',
  rose:      '#fb7185',
  coral:     '#f87171',
};

export function resolveColorHex(name: string): string {
  const key = name.toLowerCase().replace(/[\s-]+/g, '_');
  return COLOR_MAP[key] ?? COLOR_MAP[name.toLowerCase()] ?? '#94a3b8';
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ColorSelectorProps {
  /** List of color names to display */
  colors: string[];
  /** Currently selected color name */
  selectedColor: string;
  /** Optional map of color name → variant image URL for the dot indicator */
  variantImages?: Record<string, string>;
  /** Called when a color swatch is clicked */
  onSelect: (color: string) => void;
  /** Optional label shown above the selector */
  label?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  variantImages = {},
  onSelect,
  label = 'Color',
}) => {
  const normalizeColor = (value: string) => value.toLowerCase().trim().replace(/\s+/g, ' ');

  if (!colors.length) return null;

  return (
    <div>
      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
        {label}
        {selectedColor && (
          <span className="text-primary ml-2 normal-case font-black">— {selectedColor}</span>
        )}
      </h4>

      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = normalizeColor(selectedColor) === normalizeColor(color);
          const hasVariantImage = Boolean(variantImages[color]);
          const hex = resolveColorHex(color);

          return (
            <motion.button
              key={color}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(color)}
              title={color}
              className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border-2 transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/15'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
            >
              {/* Color swatch circle */}
              <span
                className={`w-5 h-5 rounded-full border shadow-inner transition-transform
                  ${isSelected ? 'scale-110 border-white shadow-md ring-2 ring-primary/30' : 'border-slate-200'}`}
                style={{ backgroundColor: hex }}
              />

              {/* Color name */}
              <span className={`font-black text-xs uppercase tracking-widest select-none
                ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                {color}
              </span>

              {/* Green dot — variant has its own image */}
              {hasVariantImage && (
                <span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"
                  title="Has variant image"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
