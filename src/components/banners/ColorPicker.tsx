import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-xs font-semibold text-slate-500">{label}</label>
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={value || '#000000'}
        onChange={e => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-1 flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  </div>
);
