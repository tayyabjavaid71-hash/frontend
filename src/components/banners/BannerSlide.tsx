import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Banner } from '../../types/banner';
import { BannerButtons } from './BannerButtons';
import { trackBannerEvent } from '../../services/bannerService';

interface BannerSlideProps {
  banner: Banner;
  isActive: boolean;
}

export const BannerSlide: React.FC<BannerSlideProps> = ({ banner, isActive }) => {
  // Track impression once per banner becoming active
  useEffect(() => {
    if (!isActive) return;
    trackBannerEvent(banner.id, 'impression').catch(() => {/* silent */});
  }, [isActive, banner.id]);

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 flex"
        >
          {/* ── Right: Product Image ────────────────────── */}
          <div className="absolute inset-0">
            <img
              src={banner.desktop_image}
              alt={banner.title}
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
            {/* Overlay from left */}
            {banner.overlay_enabled && (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, ${banner.overlay_color ?? '#3b0764'} 0%, ${banner.overlay_color ?? '#3b0764'}cc 30%, ${banner.overlay_color ?? '#3b0764'}44 55%, transparent 75%)`,
                }}
              />
            )}
          </div>

          {/* ── Left: Text Content ───────────────────────── */}
          <div className="relative z-10 flex flex-col justify-center w-1/2 px-10 lg:px-14 xl:px-16 text-white">
            {/* Brand label */}
            <span className="text-xs font-black uppercase tracking-[0.25em] text-white/60 mb-3">
              {banner.subtitle ?? 'JT Collections'}
            </span>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-tight whitespace-pre-line drop-shadow-lg mb-4">
              {banner.title}
            </h1>

            {/* Description */}
            {banner.description && (
              <p className="text-sm lg:text-base text-white/80 max-w-xs leading-relaxed mb-2">
                {banner.description}
              </p>
            )}

            {/* Buttons */}
            <BannerButtons
              buttons={banner.banner_buttons ?? []}
              bannerId={banner.id}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
