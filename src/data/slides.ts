export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  image: string;
}

export const slides: Slide[] = [
  {
    id: 1,
    title: "UNLEASH THE ICON WITHIN YOU",
    subtitle: "The 2026 Collection",
    category: "New Arrivals",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 2,
    title: "DEFINE YOUR SIGNATURE STYLE",
    subtitle: "Premium Kurtis",
    category: "Kurtis",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 3,
    title: "CURATED FOR THE MODERN WOMAN",
    subtitle: "Exclusive Collection",
    category: "3 Piece",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2070",
  },
];
