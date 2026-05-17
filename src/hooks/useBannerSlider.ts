import { useState, useEffect, useCallback } from 'react';
import { getBanners } from '../services/bannerService';
import type { Banner } from '../types/banner';

// Static fallback slides imported from data/slides.ts
import { slides as staticSlides } from '../data/slides';

interface UseBannerSliderReturn {
  banners: Banner[];
  isLoading: boolean;
  error: string | null;
  activeIndex: number;
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  usingFallback: boolean;
}

// Convert static slide into a Banner shape for the slider
function staticToBanner(s: (typeof staticSlides)[0], index: number): Banner {
  return {
    id: String(s.id),
    title: s.title,
    subtitle: s.subtitle,
    description: s.desc,
    desktop_image: s.image,
    mobile_image: s.image,
    banner_type: 'hero',
    background_type: 'gradient',
    gradient_start: '#3b0764',
    gradient_end: '#7C3AED',
    background_color: '#7C3AED',
    text_color: '#ffffff',
    font_family: 'Inter',
    title_size: '64px',
    description_size: '20px',
    content_position: 'left',
    animation_type: 'slide',
    device_type: 'all',
    overlay_enabled: true,
    overlay_color: '#7C3AED',
    is_active: true,
    sort_order: index,
    auto_slide: true,
    slide_duration: 4500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    banner_buttons: [
      {
        id: `btn-${s.id}`,
        banner_id: String(s.id),
        text: 'Shop Now',
        link: '/shop',
        style_type: 'primary',
        background_color: s.ctaBg ?? '#FBBF24',
        text_color: '#000000',
        border_radius: '14px',
        padding: '16px 30px',
        open_new_tab: false,
        sort_order: 0,
      },
    ],
  };
}

export function useBannerSlider(): UseBannerSliderReturn {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error]        = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Load banners from Supabase
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getBanners();
        if (cancelled) return;

        if (data.length > 0) {
          setBanners(data);
          setUsingFallback(false);
        } else {
          setBanners(staticSlides.map(staticToBanner));
          setUsingFallback(true);
        }
      } catch {
        if (cancelled) return;
        setBanners(staticSlides.map(staticToBanner));
        setUsingFallback(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Auto-advance
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const duration = banners[activeIndex]?.slide_duration ?? 4500;
    const id = setTimeout(() => {
      setActiveIndex(i => (i + 1) % banners.length);
    }, duration);
    return () => clearTimeout(id);
  }, [banners, activeIndex, isPaused]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, banners.length - 1)));
  }, [banners.length]);

  const goNext = useCallback(() => {
    setActiveIndex(i => (i + 1) % banners.length);
  }, [banners.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(i => (i - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const pause  = useCallback(() => setIsPaused(true),  []);
  const resume = useCallback(() => setIsPaused(false), []);

  return { banners, isLoading, error, activeIndex, goTo, goNext, goPrev, isPaused, pause, resume, usingFallback };
}
