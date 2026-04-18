import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { slides } from '../data/slides';

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.04,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 1.04,
  }),
};

const AUTOPLAY_MS = 4000;

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
  const ease = 'easeOut' as const;
  const contentTransition = { duration: 0.55, ease };

  return (
    <section
      className="relative h-[90vh] overflow-hidden bg-slate-900 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* â”€â”€ Slides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-60"
            loading="eager"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/50 to-slate-900/10" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-360 mx-auto px-6 w-full">
              <div className="max-w-2xl">

                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...contentTransition, delay: 0.1 }}
                  className="text-accent font-black tracking-[0.4em] uppercase text-xs mb-6 block"
                >
                  {slide.subtitle}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...contentTransition, delay: 0.25 }}
                  className="text-white text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-5 animate-fadeIn"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...contentTransition, delay: 0.4 }}
                  className="text-yellow-400 text-base md:text-lg font-semibold mb-10 tracking-wide"
                >
                  Your identity, our design
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...contentTransition, delay: 0.55 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    to="/shop"
                    className="bg-accent hover:bg-accent-hover text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest inline-flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/20"
                  >
                    Shop Now <ArrowRight size={14} />
                  </Link>
                  <Link
                    to={`/shop?category=${encodeURIComponent(slide.category)}`}
                    className="border border-white/25 backdrop-blur-md text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    {slide.category}
                  </Link>
                </motion.div>

              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* â”€â”€ Prev / Next Buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous slide"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => paginate(1)}
        aria-label="Next slide"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* â”€â”€ Pagination Dots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-accent' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* â”€â”€ Auto-play progress bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!paused && (
        <motion.div
          key={`progress-${current}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-0.5 w-full bg-accent origin-left z-20"
        />
      )}

      {/* â”€â”€ Slide counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="absolute bottom-10 right-6 z-20 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
        {String(current + 1).padStart(2, '0')} / {String(length).padStart(2, '0')}
      </div>
    </section>
  );
};
