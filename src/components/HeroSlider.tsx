import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BannerSlide } from './banners/BannerSlide';
import { useBannerSlider } from '../hooks/useBannerSlider';

export const HeroSlider: React.FC = () => {
  const {
    banners,
    isLoading,
    activeIndex,
    goTo,
    goNext,
    goPrev,
    pause,
    resume,
  } = useBannerSlider();

  if (isLoading) {
    return (
      <div className="flex-1 h-[420px] md:h-[520px] lg:h-[580px] bg-violet-900 animate-pulse rounded-xl" />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex-1 h-[420px] md:h-[520px] lg:h-[580px] bg-violet-900 flex items-center justify-center text-white/50 rounded-xl">
        No banners configured
      </div>
    );
  }

  return (
    <div
      className="relative flex-1 overflow-hidden rounded-xl shadow-xl"
      style={{ minHeight: '420px', height: 'clamp(420px, 45vw, 600px)' }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Slides */}
      {banners.map((banner, i) => (
        <BannerSlide key={banner.id} banner={banner} isActive={i === activeIndex} />
      ))}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <div
          key={`${activeIndex}-progress`}
          className="h-full bg-white/60"
          style={{
            animation: `slideProgress ${banners[activeIndex]?.slide_duration ?? 4500}ms linear forwards`,
          }}
        />
      </div>

      {/* Prev / Next */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-5 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      <span className="absolute top-4 right-4 z-20 text-xs font-bold text-white/60">
        {activeIndex + 1} / {banners.length}
      </span>

      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;
