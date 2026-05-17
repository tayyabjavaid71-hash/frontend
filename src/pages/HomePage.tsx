import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Star, Truck, RefreshCw, Lock, Headphones as SupportIcon,
  ChevronRight, Mail, Tag, Sparkles, ShoppingBag, Heart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { HeroSlider } from '../components/HeroSlider';

/* ─── Data ──────────────────────────────────────────────────────────── */

const SRS_CATEGORIES = [
  { name: 'Unstitched',   img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { name: '3 Piece',      img: 'https://images.pexels.com/photos/2065162/pexels-photo-2065162.jpeg?w=800' },
  { name: '2 Piece',      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
  { name: 'Kurtis',       img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80' },
  { name: 'Maxi',         img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80' },
  { name: 'Abaya',        img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80' },
  { name: 'Western Wear', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
  { name: 'New Arrivals', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80' },
  { name: 'Sale',         img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80' },
];

const SIDEBAR_CATEGORIES = [
  { name: 'Home',         icon: '🏠',  link: '/' },
  { name: 'Unstitched',   icon: '🧵',  link: '/shop?category=Unstitched' },
  { name: '3 Piece',      icon: '👗',  link: '/shop?category=3+Piece' },
  { name: '2 Piece',      icon: '👘',  link: '/shop?category=2+Piece' },
  { name: 'Kurtis',       icon: '👚',  link: '/shop?category=Kurtis' },
  { name: 'Maxi',         icon: '🌺',  link: '/shop?category=Maxi' },
  { name: 'Abaya',        icon: '🧕',  link: '/shop?category=Abaya' },
  { name: 'Western Wear', icon: '👖',  link: '/shop?category=Western+Wear' },
  { name: 'New Arrivals', icon: '✨',  link: '/shop?category=New+Arrivals' },
  { name: 'Sale',         icon: '🏷️', link: '/shop?category=Sale' },
  { name: 'View All Categories', icon: '📋', link: '/shop' },
];

const ANNOUNCEMENT_MSGS = [
  '🎉 Big Summer Sale is LIVE! Get up to 60% OFF on selected products.',
  '✨ New Arrivals Just Dropped! Shop the Latest 2026 Collection.',
  '🚚 Free Delivery on Orders Above PKR 2,500! Shop Now.',
  '💎 Exclusive 3-Piece & Unstitched Suits — Luxury Fabrics Available.',
  '🏷️ Limited Time: Extra 15% OFF on Kurtis & Western Wear Collections.',
  '⭐ Premium Quality. Guaranteed Authenticity. 14-Day Easy Returns.',
];

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
  categories?: { name: string };
}

/* ─── Component ─────────────────────────────────────────────────────── */

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<{ name: string; img: string }[]>(SRS_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          productService.fetchProducts({ limit: 10 }),
          productService.fetchCategories(),
        ]);
        setProducts((fetchedProducts as unknown as Product[]) || []);

        if (fetchedCategories && fetchedCategories.length > 0) {
          const merged = fetchedCategories.map((dbCat: any) => {
            const fallback = SRS_CATEGORIES.find(
              c => c.name.toLowerCase() === dbCat.name.toLowerCase()
            );
            return {
              name: dbCat.name,
              img:
                dbCat.image_url ||
                fallback?.img ||
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
            };
          });
          setDbCategories(merged);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── AUTO-SCROLLING ANNOUNCEMENT TICKER ───────────────────────── */}
      <div className="bg-primary text-white py-2.5 overflow-hidden relative select-none">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-linear-to-r from-primary to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-linear-to-l from-primary to-transparent z-10" />

        {/* Scrolling track */}
        <div className="flex animate-marquee-ticker gap-0 w-max">
          {[...ANNOUNCEMENT_MSGS, ...ANNOUNCEMENT_MSGS].map((msg, i) => (
            <span key={i} className="flex items-center gap-6 text-sm font-medium whitespace-nowrap px-10">
              {msg}
              <span className="text-purple-300 text-lg">•</span>
            </span>
          ))}
        </div>
      </div>

      <Navbar />

      <main className="flex-1">

        {/* ── HERO + SIDEBAR ────────────────────────────────────────────── */}
        <div className="max-w-350 mx-auto px-4 sm:px-6 py-5 flex gap-5">

          {/* ── Left Sidebar ── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden h-full">
              {/* Sidebar header */}
              <div className="px-5 py-4 bg-primary flex items-center gap-2">
                <ShoppingBag size={15} className="text-white/80" />
                <h2 className="text-white font-black text-xs uppercase tracking-widest">
                  All Categories
                </h2>
              </div>

              {/* Category list */}
              <nav className="py-1">
                {SIDEBAR_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.link}
                    className={`flex items-center gap-3.5 px-5 py-3.5 hover:bg-purple-50 hover:text-primary transition-all duration-150 group ${
                      cat.name === 'View All Categories'
                        ? 'text-primary font-black border-t border-purple-100 mt-1 pt-3.5'
                        : 'text-slate-600'
                    }`}
                  >
                    <span className="text-lg leading-none w-6 text-center">{cat.icon}</span>
                    <span className="flex-1 text-sm font-semibold">{cat.name}</span>
                    <ChevronRight
                      size={13}
                      className="text-slate-300 group-hover:text-primary transition-colors shrink-0"
                    />
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Hero Slider ── */}
          <div className="flex-1 min-w-0">
            <HeroSlider />
          </div>
        </div>

        {/* ── TRUST BAR ────────────────────────────────────────────────── */}
        <div className="bg-white border-y border-purple-100 py-6">
          <div className="max-w-350 mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Truck size={22} />,        title: 'Free Delivery',    sub: 'On orders above PKR 2,500' },
                { icon: <RefreshCw size={22} />,    title: 'Easy Returns',     sub: '14-day return policy' },
                { icon: <Lock size={22} />,         title: 'Secure Payments',  sub: '100% secure payments' },
                { icon: <SupportIcon size={22} />,  title: '24/7 Support',     sub: 'Dedicated support' },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-purple-50 bg-purple-50/40 hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary border border-purple-100 shadow-sm shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{f.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TODAY'S BEST DEALS ────────────────────────────────────────── */}
        <section className="py-12 max-w-350 mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tag size={14} className="text-primary" />
                <span className="text-xs font-black text-primary uppercase tracking-widest">Hot Deals</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Today's Best Deals</h2>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-1.5 text-sm font-black text-primary hover:text-primary-dark transition-colors bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl"
            >
              View All Deals <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {loading
              ? [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-80 bg-purple-50 animate-pulse rounded-2xl" />
                ))
              : products.slice(0, 5).map(p => (
                  <ProductCard key={p.id} {...p} category={p.categories?.name || 'Collection'} />
                ))}
          </div>
        </section>

        {/* ── SHOP BY CATEGORIES ───────────────────────────────────────── */}
        <section className="w-full bg-linear-to-br from-purple-50 via-white to-purple-50/60 py-14 overflow-hidden border-y border-purple-100">
          <div className="max-w-350 mx-auto px-4 sm:px-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-xs font-black text-primary uppercase tracking-widest">Explore</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800">Shop by Categories</h2>
              </div>
              <Link
                to="/shop"
                className="text-sm font-black text-primary flex items-center gap-1.5 bg-white hover:bg-purple-50 border border-purple-200 px-5 py-2.5 rounded-xl transition-colors"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {/* Auto-scroll strip */}
            <div className="relative w-full overflow-hidden">
              {/* Fade edges */}
              <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-linear-to-r from-purple-50 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-linear-to-l from-purple-50 to-transparent z-10" />

              <div className="flex animate-category-scroll gap-8 w-max">
                {[...dbCategories, ...dbCategories].map((cat, index) => (
                  <Link
                    key={index}
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="flex flex-col items-center min-w-40 cursor-pointer group"
                  >
                    <div className="w-35 h-35 rounded-3xl overflow-hidden shadow-md border-2 border-white group-hover:border-primary/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-200">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-4 px-3 py-1.5 bg-white rounded-full border border-purple-100 shadow-sm group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <h3 className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors text-center whitespace-nowrap">
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROMO BANNERS ────────────────────────────────────────────── */}
        <section className="py-10 max-w-350 mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Banner 1 */}
            <Link
              to="/shop?category=Sale"
              className="relative h-48 rounded-2xl overflow-hidden flex items-center bg-linear-to-br from-emerald-400 to-teal-600 group shadow-lg shadow-emerald-200"
            >
              <div className="relative z-10 p-7">
                <span className="text-white/80 text-xs font-black uppercase tracking-widest block mb-1">
                  Fashion Sale
                </span>
                <h3 className="font-black text-2xl text-white leading-tight">Up to 60% OFF</h3>
                <p className="text-emerald-100 text-sm mt-1">On Selected Pieces</p>
                <span className="mt-4 text-xs font-black flex items-center gap-1.5 text-white bg-white/20 rounded-full px-3 py-1.5 w-fit">
                  Shop Now <ArrowRight size={11} />
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
                alt="Sale"
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-25 group-hover:opacity-40 transition-opacity duration-300"
                loading="lazy"
              />
            </Link>

            {/* Banner 2 */}
            <Link
              to="/shop?category=New+Arrivals"
              className="relative h-48 rounded-2xl overflow-hidden flex items-center bg-linear-to-br from-amber-400 to-orange-500 group shadow-lg shadow-amber-200"
            >
              <div className="relative z-10 p-7">
                <span className="text-white/80 text-xs font-black uppercase tracking-widest block mb-1">
                  New Arrivals
                </span>
                <h3 className="font-black text-2xl text-white leading-tight">Min. 40% OFF</h3>
                <p className="text-amber-100 text-sm mt-1">On New Arrivals</p>
                <span className="mt-4 text-xs font-black flex items-center gap-1.5 text-white bg-white/20 rounded-full px-3 py-1.5 w-fit">
                  Shop Now <ArrowRight size={11} />
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"
                alt="New Arrivals"
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-25 group-hover:opacity-40 transition-opacity duration-300"
                loading="lazy"
              />
            </Link>

            {/* Banner 3 */}
            <Link
              to="/shop"
              className="relative h-48 rounded-2xl overflow-hidden flex items-center bg-linear-to-br from-primary to-primary-dark group shadow-lg shadow-purple-300"
            >
              <div className="relative z-10 p-7">
                <span className="text-white/70 text-xs font-black uppercase tracking-widest block mb-1">
                  All Collections
                </span>
                <h3 className="font-black text-2xl text-white leading-tight">Best Deals</h3>
                <p className="text-purple-200 text-sm mt-1">On All Collections</p>
                <span className="mt-4 text-xs font-black flex items-center gap-1.5 text-white bg-white/20 rounded-full px-3 py-1.5 w-fit">
                  Shop Now <ArrowRight size={11} />
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80"
                alt="Best Deals"
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300"
                loading="lazy"
              />
            </Link>
          </div>
        </section>

        {/* ── BEST SELLING PRODUCTS ─────────────────────────────────────── */}
        <section className="py-12 max-w-350 mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart size={14} className="text-primary" fill="currentColor" />
                <span className="text-xs font-black text-primary uppercase tracking-widest">Top Picks</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Best Selling Products</h2>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-1.5 text-sm font-black text-primary hover:text-primary-dark transition-colors bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {loading
              ? [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-80 bg-purple-50 animate-pulse rounded-2xl" />
                ))
              : products.slice(3, 8).map(p => (
                  <ProductCard key={p.id} {...p} category={p.categories?.name || 'Collection'} />
                ))}
          </div>
        </section>

        {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
        <section className="mx-4 sm:mx-6 mb-10 rounded-3xl overflow-hidden">
          <div className="bg-linear-to-r from-primary via-primary to-primary-dark py-14 px-8 relative">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 right-32 w-72 h-72 bg-white/5 rounded-full" />

            <div className="relative max-w-350 mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center shrink-0 border border-white/20">
                  <Mail size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">Subscribe to our Newsletter</h3>
                  <p className="text-purple-200 text-sm mt-0.5">
                    Get the latest updates on new arrivals, offers and more.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 sm:w-72 px-5 py-3.5 rounded-xl border border-white/20 text-sm bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
                />
                <button
                  onClick={() => setEmail('')}
                  className="bg-white text-primary px-7 py-3.5 rounded-xl text-sm font-black hover:bg-purple-50 transition-colors whitespace-nowrap shadow-lg shadow-purple-900/20"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
        <section className="bg-white py-16 border-t border-purple-50">
          <div className="max-w-350 mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star size={14} className="text-primary" fill="currentColor" />
              <span className="text-xs font-black text-primary uppercase tracking-widest">Real Reviews</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-12">
              Loved by Women Nationwide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Ayesha M.', text: 'The luxury 3-piece suit I ordered exceeded my expectations. Premium quality right here!', rating: 5 },
                { name: 'Fatima Z.', text: 'Incredible customer service and ultra-fast delivery. The fabric is absolutely premium.', rating: 5 },
                { name: 'Sana R.',   text: 'Finally, an elite brand that understands modern cuts while retaining traditional elegance.', rating: 5 },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-purple-100 text-left shadow-sm hover:shadow-md hover:shadow-purple-100 transition-shadow"
                >
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed italic mb-6">"{t.text}"</p>
                  <div>
                    <span className="font-black text-slate-800 text-sm block">{t.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Verified Buyer</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SALE BANNER ───────────────────────────────────────────────── */}
        <section className="mx-4 sm:mx-6 mb-16 rounded-3xl overflow-hidden relative bg-linear-to-r from-primary-dark via-primary to-purple-500">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80"
            alt="Sale"
            className="w-full h-64 object-cover opacity-20"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <span className="text-purple-200 font-black uppercase tracking-[0.5em] text-xs mb-4">
              Limited Time
            </span>
            <h2 className="text-white text-4xl md:text-6xl font-black tracking-tighter mb-5">
              Mega Sale 🔥
            </h2>
            <p className="text-purple-200 mb-8 font-medium">Up to 60% off on selected pieces</p>
            <Link
              to="/shop?category=Sale"
              className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-50 hover:scale-105 transition-all inline-flex items-center gap-3 shadow-xl shadow-purple-900/30"
            >
              Shop Sale <ArrowRight size={15} />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

