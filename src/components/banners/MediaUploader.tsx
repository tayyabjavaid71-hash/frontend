import React, { useState, useRef } from 'react';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { uploadBannerImage } from '../../services/bannerService';

interface MediaUploaderProps {
  label:     string;
  value:     string;
  onChange:  (url: string) => void;
  className?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label, value, onChange, className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadBannerImage(file);
      onChange(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-semibold text-slate-500">{label}</label>

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        {value ? (
          <img src={value} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
        ) : uploading ? (
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        ) : (
          <div className="space-y-1 text-slate-400">
            <Upload className="w-8 h-8 mx-auto" />
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs">PNG, JPG, WebP — max 5 MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Paste URL */}
      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Or paste image URL…"
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex items-center gap-1 text-xs text-red-500 hover:underline"
        >
          <Trash2 size={11} /> Remove
        </button>
      )}
    </div>
  );
};
