import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade, EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-creative';

import { useBannerSlider } from '../hooks/useBannerSlider';
import { trackBannerEvent } from '../services/bannerService';
import { BannerButtons } from './banners/BannerButtons';
import type { Banner } from '../types/banner';

// ── Build background style from banner data ──────────────────────────────────
function buildBackground(banner: Banner): React.CSSProperties {
  if (banner.background_type === 'solid') {
    return { backgroundColor: banner.background_color ?? banner.gradient_start };
  }
  if (banner.background_type === 'image' && banner.desktop_image) {
    return {
      backgroundImage: `url(${banner.desktop_image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {
    background: `linear-gradient(135deg, ${banner.gradient_start}, ${banner.gradient_end})`,
  };
}

// ── Individual slide component ────────────────────────────────────────────────
const SlideContent: React.FC<{ banner: Banner }> = ({ banner }) => {
  const position =
    banner.content_position === 'right' ? 'items-end text-right' :
    banner.content_position === 'center' ? 'items-center text-center' :
    'items-start text-left';

  return (
    <div
      className="relative w-full h-full flex"
      style={buildBackground(banner)}
    >
      {/* Product image (right side, 55%) */}
      {banner.desktop_image && banner.background_type !== 'image' && (
        <div className="absolute inset-y-0 right-0 w-[58%] overflow-hidden">
          <img
            src={banner.desktop_image}
            alt={banner.title}
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
          {/* Blend overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${banner.gradient_start} 0%, ${banner.gradient_start}bb 20%, transparent 55%)`,
            }}
          />
        </div>
      )}

      {/* Text content */}
      <div
        className={`relative z-10 flex flex-col justify-center ${position} w-1/2 px-8 md:px-12 lg:px-16`}
      >
        {/* Subtitle / brand label */}
        {banner.subtitle && (
          <span
            className="text-xs font-black uppercase tracking-[0.25em] opacity-70 mb-3"
            style={{ color: banner.text_color, fontFamily: banner.font_family }}
          >
            {banner.subtitle}
          </span>
        )}

        {/* Title */}
        <h1
          className="font-black leading-tight whitespace-pre-line drop-shadow-lg mb-4"
          style={{
            color:      banner.text_color,
            fontFamily: banner.font_family,
            fontSize:   `clamp(28px, 4vw, ${banner.title_size})`,
          }}
        >
          {banner.title}
        </h1>

        {/* Description */}
        {banner.description && (
          <p
            className="max-w-xs leading-relaxed mb-6 opacity-85"
            style={{
              color:      banner.text_color,
              fontFamily: banner.font_family,
              fontSize:   `clamp(13px, 1.4vw, ${banner.description_size})`,
            }}
          >
            {banner.description}
          </p>
        )}

        {/* CTA Buttons */}
        <BannerButtons
          buttons={banner.banner_buttons ?? []}
          bannerId={banner.id}
        />
      </div>
    </div>
  );
};

// ── Main HeroSlider ───────────────────────────────────────────────────────────
export const HeroSlider: React.FC = () => {
  const { banners, isLoading } = useBannerSlider();

  if (isLoading) {
    return (
      <div className="flex-1 rounded-xl bg-violet-900 animate-pulse"
           style={{ minHeight: 'clamp(400px, 45vw, 600px)' }} />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex-1 rounded-xl bg-violet-900 flex items-center justify-center text-white/40"
           style={{ minHeight: 'clamp(400px, 45vw, 600px)' }}>
        No banners configured
      </div>
    );
  }

  const firstBanner = banners[0];
  const effect = firstBanner?.animation_type === 'fade' ? 'fade'
    : firstBanner?.animation_type === 'zoom'  ? 'creative'
    : undefined;

  return (
    <div className="flex-1 rounded-xl overflow-hidden shadow-xl"
         style={{ minHeight: 'clamp(400px, 45vw, 600px)' }}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade, EffectCreative]}
        effect={effect}
        creativeEffect={effect === 'creative' ? {
          prev:  { shadow: true, translate: ['-120%', 0, -500] },
          next:  { translate: ['100%', 0, 0] },
        } : undefined}
        loop={banners.length > 1}
        autoplay={
          banners.some(b => b.auto_slide)
            ? { delay: firstBanner?.slide_duration ?? 5000, disableOnInteraction: false }
            : false
        }
        navigation
        pagination={{ clickable: true }}
        className="w-full h-full"
        style={{ height: 'clamp(400px, 45vw, 600px)' } as React.CSSProperties}
        onSlideChange={swiper => {
          const banner = banners[swiper.realIndex];
          if (banner) {
            trackBannerEvent(banner.id, 'impression').catch(() => {/* silent */});
          }
        }}
      >
        {banners.map(banner => (
          <SwiperSlide key={banner.id} className="w-full h-full">
            <SlideContent banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          background: rgba(0,0,0,0.3);
          width: 36px !important;
          height: 36px !important;
          border-radius: 50%;
          padding: 8px;
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 14px !important;
          font-weight: 900;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(0,0,0,0.6);
        }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.5) !important;
          width: 8px !important;
          height: 8px !important;
        }
        .swiper-pagination-bullet-active {
          background: white !important;
          width: 20px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;
