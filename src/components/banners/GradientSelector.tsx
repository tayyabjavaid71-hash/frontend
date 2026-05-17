import React from 'react';
import { ColorPicker } from './ColorPicker';

const GRADIENT_PRESETS = [
  { name: 'Purple',  start: '#3b0764', end: '#7C3AED' },
  { name: 'Emerald', start: '#064e3b', end: '#10b981' },
  { name: 'Ocean',   start: '#0c4a6e', end: '#0ea5e9' },
  { name: 'Rose',    start: '#881337', end: '#f43f5e' },
  { name: 'Amber',   start: '#78350f', end: '#f59e0b' },
  { name: 'Slate',   start: '#0f172a', end: '#475569' },
  { name: 'Teal',    start: '#134e4a', end: '#14b8a6' },
  { name: 'Indigo',  start: '#1e1b4b', end: '#6366f1' },
];

interface GradientSelectorProps {
  gradientStart: string;
  gradientEnd:   string;
  onChangeStart: (v: string) => void;
  onChangeEnd:   (v: string) => void;
}

export const GradientSelector: React.FC<GradientSelectorProps> = ({
  gradientStart, gradientEnd, onChangeStart, onChangeEnd,
}) => {
  return (
    <div className="space-y-4">
      {/* Gradient preview */}
      <div
        className="w-full h-10 rounded-xl border border-slate-200"
        style={{ background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }}
      />

      {/* Presets */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {GRADIENT_PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => { onChangeStart(p.start); onChangeEnd(p.end); }}
              title={p.name}
              className="w-8 h-8 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform"
              style={{ background: `linear-gradient(135deg, ${p.start}, ${p.end})` }}
            />
          ))}
        </div>
      </div>

      {/* Manual pickers */}
      <div className="grid grid-cols-2 gap-3">
        <ColorPicker label="Gradient Start" value={gradientStart} onChange={onChangeStart} />
        <ColorPicker label="Gradient End"   value={gradientEnd}   onChange={onChangeEnd}   />
      </div>
    </div>
  );
};
