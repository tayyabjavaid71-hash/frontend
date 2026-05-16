import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, RefreshCw, Lock, Headphones, ChevronRight, X, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { HeroSlider } from '../components/HeroSlider';

// SRS Categories with matching images
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

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
  categories?: { name: string };
}

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<{name: string, img: string}[]>(SRS_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          productService.fetchProducts({ limit: 10 }),
          productService.fetchCategories()
        ]);
        setProducts((fetchedProducts as unknown as Product[]) || []);

        if (fetchedCategories && fetchedCategories.length > 0) {
          const merged = fetchedCategories.map((dbCat: any) => {
            const fallback = SRS_CATEGORIES.find(c => c.name.toLowerCase() === dbCat.name.toLowerCase());
            return {
              name: dbCat.name,
              img: dbCat.image_url || fallback?.img || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
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

      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────────────── */}
      {announcementVisible && (
        <div className="bg-primary text-white py-2.5 px-4 flex items-center justify-center gap-4 relative">
          <p className="text-sm font-medium text-center">
            🎉 Big Summer Sale is LIVE! Get up to 60% OFF on selected products.
          </p>
          <Link
            to="/shop?category=Sale"
            className="shrink-0 bg-white text-slate-900 text-xs font-black px-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            Shop Now
          </Link>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Navbar />

      <main className="flex-1">

        {/* ── HERO + SIDEBAR ────────────────────────────────────────────── */}
        <div className="max-w-350 mx-auto px-4 sm:px-6 py-4 flex gap-5">

          {/* Left Sidebar */}
          <aside className="hidden lg:block w-55 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="px-5 py-4 bg-primary">
                <h2 className="text-white font-black text-xs uppercase tracking-widest">Categories</h2>
              </div>
              <nav>
                {SIDEBAR_CATEGORIES.map((cat, i) => (
                  <Link
                    key={cat.name}
                    to={cat.link}
                    className={`flex items-center gap-3 px-5 py-3 text-sm hover:bg-slate-50 hover:text-primary transition-colors ${
                      i < SIDEBAR_CATEGORIES.length - 1 ? 'border-b border-slate-50' : ''
                    } ${cat.name === 'View All Categories' ? 'text-accent font-black' : 'text-slate-700'}`}
                  >
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span className="flex-1 text-xs font-semibold">{cat.name}</span>
                    <ChevronRight size={11} className="text-slate-300 shrink-0" />
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Hero Slider */}
          <div className="flex-1 min-w-0 rounded-2xl overflow-hidden">
            <HeroSlider />
          </div>
        </div>

        {/* ── TRUST BAR ────────────────────────────────────────────────── */}
        <div className="bg-white border-y border-slate-100 py-6 mt-1">
          <div className="max-w-350 mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-100">
              {[
                { icon: <Truck size={20} />,        title: 'Free Delivery',     sub: 'Nationwide Express Delivery' },
                { icon: <RefreshCw size={20} />,    title: 'Easy Returns',      sub: '14-Day Boutique Exchange' },
                { icon: <Lock size={20} />,         title: 'Secure Payments',   sub: '100% Secure Checkout' },
                { icon: <Headphones size={20} />,   title: '24/7 Support',      sub: 'Dedicated Customer Care' },
              ].map((f, i) => (
                <div key={f.title} className={`flex items-center gap-4 ${i > 0 ? 'pl-6' : ''}`}>
                  <div className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center text-primary border border-slate-100 shrink-0">
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
        <section className="py-10 max-w-350 mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-2xl font-black text-slate-800">Today's Best Deals</h2>
            <Link to="/shop" className="text-sm font-black text-primary hover:text-accent transition-colors flex items-center gap-1">
              View All Deals <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {loading
              ? [1,2,3,4,5].map(i => <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-2xl" />)
              : products.slice(0, 5).map(p => (
                  <ProductCard key={p.id} {...p} category={p.categories?.name || 'Collection'} />
                ))
            }
          </div>
        </section>

        {/* ── SHOP BY CATEGORIES (infinite scroll) ─────────────────── */}
        <section className="w-full bg-[#f4f4f4] py-14 overflow-hidden border-y border-slate-200">
          <div className="max-w-350 mx-auto px-4 sm:px-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-[#0d2344]">Shop by Categories</h2>
              <Link
                to="/shop"
                className="text-xl font-semibold text-[#0d2344] flex items-center gap-2 hover:gap-4 transition-all duration-300"
              >
                View All →
              </Link>
            </div>

            {/* Auto-scroll strip */}
            <div className="relative w-full overflow-hidden">
              <div className="flex animate-category-scroll gap-12 w-max">
                {[...dbCategories, ...dbCategories].map((cat, index) => (
                  <Link
                    key={index}
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="flex flex-col items-center min-w-[150px] cursor-pointer group"
                  >
                    <div className="w-[120px] h-[120px] rounded-[28px] overflow-hidden shadow-md">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-[#29476b] text-center">
                      {cat.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── PROMO BANNERS ────────────────────────────────────────────── */}
        <section className="py-8 max-w-350 mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Up to 60% OFF',
                sub: 'On Selected Pieces',
                img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
                link: '/shop?category=Sale',
                bg: 'bg-green-50',
                titleColor: 'text-green-900',
                subColor: 'text-green-700',
                ctaColor: 'text-green-700',
              },
              {
                title: 'Min. 40% OFF',
                sub: 'On New Arrivals',
                img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
                link: '/shop?category=New+Arrivals',
                bg: 'bg-amber-50',
                titleColor: 'text-amber-900',
                subColor: 'text-amber-700',
                ctaColor: 'text-amber-700',
              },
              {
                title: 'Best Deals',
                sub: 'On All Collections',
                img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
                link: '/shop',
                bg: 'bg-slate-800',
                titleColor: 'text-white',
                subColor: 'text-slate-300',
                ctaColor: 'text-accent',
              },
            ].map((b, i) => (
              <Link
                key={i}
                to={b.link}
                className={`relative h-44 rounded-2xl overflow-hidden flex items-center group ${b.bg}`}
              >
                <div className="relative z-10 p-7">
                  <h3 className={`font-black text-xl ${b.titleColor}`}>{b.title}</h3>
                  <p className={`text-sm mt-1 ${b.subColor}`}>{b.sub}</p>
                  <span className={`mt-4 text-xs font-black flex items-center gap-1.5 ${b.ctaColor}`}>
                    Shop Now <ArrowRight size={11} />
                  </span>
                </div>
                <img
                  src={b.img}
                  alt={b.title}
                  className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* ── BEST SELLING PRODUCTS ─────────────────────────────────────── */}
        <section className="py-10 max-w-350 mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-2xl font-black text-slate-800">Best Selling Products</h2>
            <Link to="/shop" className="text-sm font-black text-primary hover:text-accent transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {loading
              ? [1,2,3,4,5].map(i => <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-2xl" />)
              : products.slice(3, 8).map(p => (
                  <ProductCard key={p.id} {...p} category={p.categories?.name || 'Collection'} />
                ))
            }
          </div>
        </section>

        {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
        <section className="bg-slate-50 border-t border-slate-100 py-12">
          <div className="max-w-350 mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shrink-0">
                <Mail size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">Subscribe to our Newsletter</h3>
                <p className="text-sm text-slate-500 mt-0.5">Get the latest updates on new arrivals, offers and more.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 sm:w-72 px-5 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                onClick={() => setEmail('')}
                className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-primary-dark transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
        <section className="bg-white py-20 border-t border-slate-100">
          <div className="max-w-350 mx-auto px-4 sm:px-6 text-center">
            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Real Reviews</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter mb-14">
              Loved by Women Nationwide <Star className="inline-block text-amber-400 -mt-2" fill="currentColor" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {[
                { name: 'Ayesha M.', text: 'The luxury 3-piece suit I ordered exceeded my expectations. Zara-level quality right here in Pakistan!', rating: 5 },
                { name: 'Fatima Z.', text: 'Incredible customer service and ultra-fast delivery. The fabric is absolutely premium.', rating: 5 },
                { name: 'Sana R.', text: 'Finally, an elite brand that understands modern cuts while retaining traditional elegance. Highly recommended.', rating: 5 },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 p-8 rounded-4xl border border-slate-100 text-left"
                >
                  <div className="flex text-amber-400 mb-5">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={15} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed italic mb-6">"{t.text}"</p>
                  <div>
                    <span className="font-black text-slate-800 text-sm block">{t.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Verified Buyer</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SALE BANNER ───────────────────────────────────────────────── */}
        <section className="mx-4 sm:mx-6 mb-16 rounded-[2.5rem] overflow-hidden relative bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80"
            alt="Sale"
            className="w-full h-72 object-cover opacity-30"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <span className="text-accent font-black uppercase tracking-[0.5em] text-xs mb-4">Limited Time</span>
            <h2 className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-6">Mega Sale 🔥</h2>
            <p className="text-slate-300 mb-8 font-medium">Up to 50% off on selected pieces</p>
            <Link
              to="/shop?category=Sale"
              className="bg-accent text-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all inline-flex items-center gap-3"
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
