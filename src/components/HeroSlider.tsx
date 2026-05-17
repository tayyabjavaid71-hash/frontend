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

// ── Build background base style ───────────────────────────────────────────────
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
    background: `linear-gradient(135deg, ${banner.gradient_start ?? '#3b0764'} 0%, ${banner.gradient_end ?? '#7C3AED'} 100%)`,
  };
}

// ── Individual slide ──────────────────────────────────────────────────────────
const SlideContent: React.FC<{ banner: Banner }> = ({ banner }) => {
  const isCenter = banner.content_position === 'center';
  const isRight  = banner.content_position === 'right';

  return (
    <div className="relative w-full h-full flex overflow-hidden" style={buildBackground(banner)}>

      {/* ── Product image (right 60%) ─────────────────────── */}
      {banner.desktop_image && banner.background_type !== 'image' && (
        <div className="absolute inset-y-0 right-0 w-[60%]">
          <img
            src={banner.desktop_image}
            alt={banner.title}
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
          {/* Deep cinematic gradient fade from left */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to right,
              ${banner.gradient_start ?? '#3b0764'} 0%,
              ${banner.gradient_start ?? '#3b0764'}f0 10%,
              ${banner.gradient_start ?? '#3b0764'}cc 22%,
              ${banner.gradient_start ?? '#3b0764'}88 35%,
              ${banner.gradient_start ?? '#3b0764'}44 50%,
              transparent 68%)`,
          }} />
        </div>
      )}

      {/* ── Ambient bottom vignette ───────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)',
      }} />

      {/* ── Subtle noise texture overlay ─────────────────── */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />

      {/* ── Text content ──────────────────────────────────── */}
      <div
        className={`relative z-10 flex flex-col justify-center h-full px-8 md:px-12 lg:px-20 xl:px-24 ${
          isCenter ? 'items-center text-center mx-auto w-full' :
          isRight  ? 'items-end text-right ml-auto w-[52%]'    :
                     'items-start text-left w-[52%]'
        }`}
      >
        {/* Brand badge */}
        {banner.subtitle && (
          <div className="flex items-center gap-2 mb-5"
               style={{ justifyContent: isCenter ? 'center' : isRight ? 'flex-end' : 'flex-start' }}>
            <div className="h-px w-8 opacity-60" style={{ backgroundColor: banner.text_color ?? '#fff' }} />
            <span
              className="text-[11px] font-black uppercase tracking-[0.3em] opacity-75 select-none"
              style={{ color: banner.text_color ?? '#fff', fontFamily: banner.font_family ?? 'Inter' }}
            >
              {banner.subtitle}
            </span>
            <div className="h-px w-8 opacity-60" style={{ backgroundColor: banner.text_color ?? '#fff' }} />
          </div>
        )}

        {/* Title */}
        <h1
          className="font-black leading-[1.05] whitespace-pre-line mb-4 drop-shadow-2xl"
          style={{
            color:      banner.text_color  ?? '#fff',
            fontFamily: banner.font_family ?? 'Inter, sans-serif',
            fontSize:   `clamp(30px, 4.5vw, ${banner.title_size ?? '64px'})`,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 40px rgba(0,0,0,0.4)',
          }}
        >
          {banner.title}
        </h1>

        {/* Accent divider */}
        <div className="flex items-center gap-2 mb-5"
             style={{ justifyContent: isCenter ? 'center' : isRight ? 'flex-end' : 'flex-start' }}>
          <div className="h-1 w-10 rounded-full opacity-80"
               style={{ backgroundColor: banner.text_color ?? '#FBBF24' }} />
          <div className="h-1 w-4 rounded-full opacity-40"
               style={{ backgroundColor: banner.text_color ?? '#FBBF24' }} />
          <div className="h-1 w-2 rounded-full opacity-20"
               style={{ backgroundColor: banner.text_color ?? '#FBBF24' }} />
        </div>

        {/* Description */}
        {banner.description && (
          <p
            className="leading-relaxed mb-8 opacity-80 max-w-sm"
            style={{
              color:      banner.text_color  ?? '#fff',
              fontFamily: banner.font_family ?? 'Inter, sans-serif',
              fontSize:   `clamp(13px, 1.3vw, ${banner.description_size ?? '18px'})`,
              fontWeight: 400,
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
      <div
        className="flex-1 rounded-2xl overflow-hidden animate-pulse"
        style={{
          minHeight: 'clamp(400px, 45vw, 600px)',
          background: 'linear-gradient(135deg, #1e0a38 0%, #3b0764 50%, #5b21b6 100%)',
        }}
      />
    );
  }

  if (banners.length === 0) {
    return (
      <div
        className="flex-1 rounded-2xl flex items-center justify-center text-white/30 text-sm"
        style={{
          minHeight: 'clamp(400px, 45vw, 600px)',
          background: 'linear-gradient(135deg, #1e0a38, #3b0764)',
        }}
      >
        No banners configured
      </div>
    );
  }

  const firstBanner = banners[0];
  const effect = firstBanner?.animation_type === 'fade'  ? 'fade'
               : firstBanner?.animation_type === 'zoom'  ? 'creative'
               : undefined;

  return (
    <div
      className="flex-1 rounded-2xl overflow-hidden shadow-2xl"
      style={{ minHeight: 'clamp(400px, 45vw, 600px)' }}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade, EffectCreative]}
        effect={effect}
        creativeEffect={effect === 'creative' ? {
          prev: { shadow: true, translate: ['-120%', 0, -500] },
          next: { translate: ['100%', 0, 0] },
        } : undefined}
        speed={800}
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
          if (banner) trackBannerEvent(banner.id, 'impression').catch(() => {});
        }}
      >
        {banners.map(banner => (
          <SwiperSlide key={banner.id} className="w-full h-full">
            <SlideContent banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        /* Navigation arrows */
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          width: 44px !important;
          height: 44px !important;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 13px !important;
          font-weight: 900;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255,255,255,0.25);
          border-color: rgba(255,255,255,0.5);
          transform: scale(1.1);
        }
        /* Pagination dots */
        .swiper-pagination {
          bottom: 16px !important;
        }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.4) !important;
          width: 6px !important;
          height: 6px !important;
          transition: all 0.3s ease !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background: white !important;
          width: 24px !important;
          border-radius: 3px !important;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;
