import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [mainImage, setMainImage] = useState(images[0] || 'https://via.placeholder.com/600x800');

  return (
    <div className="flex flex-col gap-6">
      {/* MAIN IMAGE WITH HOVER ZOOM EFFECT */}
      <div className="relative aspect-[4/5] bg-slate-50 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-slate-200">
        <AnimatePresence mode="wait">
          <motion.img
            key={mainImage}
            src={mainImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
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
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setMainImage(img)}
            className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
              mainImage === img ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
};
