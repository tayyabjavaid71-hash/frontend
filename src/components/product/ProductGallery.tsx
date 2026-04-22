import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
  /** Driven from outside (color variant selection) — immediately switches main image */
  selectedImage?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, selectedImage }) => {
  const validImages = images.filter((img): img is string => typeof img === 'string' && img.trim() !== '');
  const [mainImage, setMainImage] = useState<string>(validImages[0] ?? '');

  // External color selection drives the main image immediately
  useEffect(() => {
    if (selectedImage && selectedImage.trim()) {
      setMainImage(selectedImage);
    }
  }, [selectedImage]);

  // When images array changes (product loads / color with no variant image) reset to first
  useEffect(() => {
    if (!selectedImage && validImages.length > 0) {
      setMainImage(validImages[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const displayImage = mainImage || validImages[0] || '';

  return (
    <div className="flex flex-col gap-6">
      {/* MAIN IMAGE */}
      <div className="relative aspect-[4/5] bg-slate-50 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-slate-200">
        <AnimatePresence mode="wait">
          <motion.img
            key={displayImage || 'placeholder'}
            src={displayImage || undefined}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="Product Main View"
          />
        </AnimatePresence>

        <div className="absolute top-6 left-6">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
            Premium Edition
          </span>
        </div>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {validImages.map((img, i) => {
          const isActive = displayImage === img;
          return (
            <button
              key={i}
              onClick={() => setMainImage(img)}
              className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                isActive
                  ? 'border-primary ring-4 ring-primary/10 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img || undefined} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
