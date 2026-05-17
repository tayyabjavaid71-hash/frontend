import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { slides } from '../data/slides';

const AUTOPLAY_MS = 4500;

export const HeroSlider: React.FC = () => {
  const [[current, direction], setPage] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const length = slides.length;

  const paginate = useCallback(
    (dir: number) =>
      setPage(([prev]) => [((prev + dir) % length + length) % length, dir]),
    [length],
  );

  const goTo = useCallback(
    (index: number) => setPage(([prev]) => [index, index > prev ? 1 : -1]),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => paginate(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, paginate]);

  const slide = slides[current];

  return (
    <section
      className="relative h-120 overflow-hidden rounded-2xl select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-linear-to-r ${slide.bg}`}
        >
          {/* ── Right: Product image – full opacity, crystal clear ── */}
          <div className="absolute right-0 top-0 w-[58%] h-full overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            {/* Soft gradient blend into the left background color */}
            <div className={`absolute inset-y-0 left-0 w-2/5 bg-linear-to-r ${slide.blendFrom} to-transparent`} />
          </div>

          {/* ── Left: Text content ── */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-[52%] pl-10 pr-4">

              <motion.span
                key={`sub-${current}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.38 }}
                className="text-white/75 text-[11px] font-black uppercase tracking-[0.35em] block mb-3"
              >
                {slide.subtitle}
              </motion.span>

              <motion.h1
                key={`title-${current}`}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.42 }}
                className="text-white font-black text-3xl md:text-[2.6rem] leading-[1.08] mb-4 whitespace-pre-line"
              >
                {slide.title}
              </motion.h1>

              <motion.div
                key={`badge-${current}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28, duration: 0.38 }}
                className="mb-4"
              >
                <span className={`inline-block ${slide.badgeBg} ${slide.badgeText} font-black text-2xl md:text-3xl px-4 py-1.5 rounded-xl leading-tight`}>
                  {slide.discount}
                </span>
              </motion.div>

              <motion.p
                key={`desc-${current}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.35 }}
                className="text-white/70 text-sm leading-relaxed mb-7 max-w-xs"
              >
                {slide.desc}
              </motion.p>

              <motion.div
                key={`cta-${current}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.35 }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(slide.category)}`}
                  className={`inline-flex items-center gap-2.5 ${slide.ctaBg} font-black text-sm px-8 py-3.5 rounded-xl hover:scale-105 active:scale-100 transition-transform duration-200 shadow-lg shadow-black/20`}
                >
                  SHOP NOW <ArrowRight size={16} />
                </Link>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Prev / Next ── */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Pagination dots ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-7 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── Auto-play progress bar ── */}
      {!paused && (
        <motion.div
          key={`progress-${current}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 w-full bg-white/40 origin-left z-20"
        />
      )}

      {/* ── Slide counter ── */}
      <div className="absolute bottom-5 right-6 z-20 text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
        {String(current + 1).padStart(2, '0')} / {String(length).padStart(2, '0')}
      </div>
    </section>
  );
};
