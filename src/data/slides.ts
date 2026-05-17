export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  desc: string;
  category: string;
  image: string;
  /** Full Tailwind gradient string for the banner background */
  bg: string;
  /** Left-side gradient color to blend into the image */
  blendFrom: string;
  /** CTA button classes */
  ctaBg: string;
  /** Badge background + text classes */
  badgeBg: string;
  badgeText: string;
}

export const slides: Slide[] = [
  {
    id: 1,
    title: "NEW 2026\nCOLLECTION",
    subtitle: "JT Collections — Premium Fashion",
    discount: "UP TO 60% OFF",
    desc: "Shop the latest unstitched & ready-to-wear luxury suits.",
    category: "New Arrivals",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070",
    bg: "from-violet-800 via-purple-700 to-purple-500",
    blendFrom: "from-violet-800",
    ctaBg: "bg-yellow-400 hover:bg-yellow-300 text-black",
    badgeBg: "bg-yellow-400",
    badgeText: "text-black",
  },
  {
    id: 2,
    title: "PREMIUM\nKURTIS",
    subtitle: "Exclusive Kurti Collection 2026",
    discount: "MIN. 40% OFF",
    desc: "Elevate your everyday look with our hand-picked premium kurtis.",
    category: "Kurtis",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=2070",
    bg: "from-emerald-800 via-teal-700 to-emerald-500",
    blendFrom: "from-emerald-800",
    ctaBg: "bg-white hover:bg-emerald-50 text-emerald-800",
    badgeBg: "bg-white",
    badgeText: "text-emerald-700",
  },
  {
    id: 3,
    title: "EXCLUSIVE\n3-PIECE SUITS",
    subtitle: "Luxury Formal Wear",
    discount: "SHOP NOW",
    desc: "Curated luxury formal suits crafted for the modern woman.",
    category: "3 Piece",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2070",
    bg: "from-sky-900 via-cyan-700 to-sky-500",
    blendFrom: "from-sky-900",
    ctaBg: "bg-cyan-300 hover:bg-cyan-200 text-slate-900",
    badgeBg: "bg-cyan-300",
    badgeText: "text-slate-900",
  },
];
