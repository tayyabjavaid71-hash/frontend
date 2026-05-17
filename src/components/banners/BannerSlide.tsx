import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Banner } from '../../types/banner';
import { BannerButtons } from './BannerButtons';
import { trackBannerEvent } from '../../services/bannerService';

interface BannerSlideProps {
  banner:   Banner;
  isActive: boolean;
}

export const BannerSlide: React.FC<BannerSlideProps> = ({ banner, isActive }) => {
  useEffect(() => {
    if (!isActive) return;
    trackBannerEvent(banner.id, 'impression').catch(() => {/* silent */});
  }, [isActive, banner.id]);

  // ── Background style ────────────────────────────────────
  const bgStyle: React.CSSProperties =
    banner.background_type === 'solid'
      ? { backgroundColor: banner.background_color ?? banner.gradient_start ?? '#7C3AED' }
      : banner.background_type === 'image' && banner.desktop_image
      ? { backgroundImage: `url(${banner.desktop_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: `linear-gradient(135deg, ${banner.gradient_start ?? '#3b0764'}, ${banner.gradient_end ?? '#7C3AED'})` };

  // ── Content alignment from content_position ─────────────
  const pos = banner.content_position ?? 'left';
  const contentClass =
    pos === 'center' ? 'items-center text-center mx-auto' :
    pos === 'right'  ? 'items-end text-right ml-auto'     : 'items-start text-left';
  const widthClass = pos === 'center' ? 'w-full px-10' : 'w-1/2 px-10 lg:px-14 xl:px-16';

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
          style={bgStyle}
        >
          {/* Background image layer (when type is not 'image' but image exists) */}
          {banner.background_type !== 'image' && banner.desktop_image && (
            <div className="absolute inset-0">
              <img src={banner.desktop_image} alt={banner.title}
                className="w-full h-full object-cover object-top" loading="eager" />
            </div>
          )}

          {/* Overlay */}
          {banner.overlay_enabled && (
            <div className="absolute inset-0" style={{
              background: pos === 'center'
                ? `rgba(0,0,0,0.45)`
                : `linear-gradient(to right, ${banner.overlay_color ?? banner.gradient_start ?? '#3b0764'} 0%, ${banner.overlay_color ?? '#3b0764'}cc 30%, ${banner.overlay_color ?? '#3b0764'}44 55%, transparent 75%)`,
            }} />
          )}

          {/* Text content */}
          <div
            className={`relative z-10 flex flex-col justify-center ${widthClass} ${contentClass}`}
            style={{
              color:      banner.text_color  ?? '#ffffff',
              fontFamily: banner.font_family ?? 'Inter, sans-serif',
            }}
          >
            {banner.subtitle && (
              <span className="text-xs font-black uppercase tracking-[0.25em] opacity-70 mb-3">
                {banner.subtitle}
              </span>
            )}

            <h1
              className="font-black leading-tight whitespace-pre-line drop-shadow-lg mb-4"
              style={{ fontSize: `clamp(28px, 4vw, ${banner.title_size ?? '64px'})` }}
            >
              {banner.title}
            </h1>

            {banner.description && (
              <p
                className="opacity-80 max-w-xs leading-relaxed mb-2"
                style={{ fontSize: `clamp(13px, 1.4vw, ${banner.description_size ?? '20px'})` }}
              >
                {banner.description}
              </p>
            )}

            <BannerButtons
              buttons={banner.banner_buttons ?? []}
              bannerId={banner.id}
              className="mt-2"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
