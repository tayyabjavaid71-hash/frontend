import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, Star, Tag } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          productService.fetchProducts({ limit: 8 }),
          productService.fetchCategories()
        ]);
        setProducts((fetchedProducts as unknown as Product[]) || []);

        if (fetchedCategories && fetchedCategories.length > 0) {
          // Merge DB categories with default images from SRS array if no image exists
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
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/30">
      <Navbar />

      <main className="flex-1">
        {/* ── HERO SLIDER ─────────────────────────────────────────────── */}
        <HeroSlider />

        {/* ── TRUST BAR ────────────────────────────────────────────────── */}
        <div className="bg-slate-50 py-12 border-b border-slate-100">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Zap size={20} />, title: 'Rapid Fulfillment', sub: 'Nationwide Express Delivery' },
              { icon: <ShieldCheck size={20} />, title: 'Hassle-Free Returns', sub: '14-Day Boutique Exchange' },
              { icon: <Star size={20} />, title: 'Master Craftsmanship', sub: 'Finest Artisanal Fabrics' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">{f.icon}</div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{f.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-bold italic">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SRS CATEGORIES GRID ───────────────────────────────────────── */}
        <section className="py-24 max-w-[1440px] mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] block mb-3">Shop by Category</span>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter">All Categories</h2>
            </div>
            <Link to="/shop" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b-2 border-slate-100 hover:border-primary">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {dbCategories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-3xl aspect-[3/4] block"
              >
                <motion.img
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-white font-black text-sm tracking-tight">{cat.name}</h3>
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-all">
                    Shop Now <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── LATEST ARRIVALS ───────────────────────────────────────────── */}
        <section className="pb-32 max-w-[1440px] mx-auto px-6">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] block mb-3">Trending Now</span>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter">Latest Arrivals</h2>
            </div>
            <Link to="/shop?category=New Arrivals" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b-2 border-slate-100 hover:border-primary">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {loading
              ? [1,2,3,4].map(i => <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-[3rem]" />)
              : products.slice(0, 4).map(p => (
                  <ProductCard key={p.id} {...p} category={p.categories?.name || 'Collection'} />
                ))
            }
          </div>
        </section>

        {/* ── SALE BANNER ───────────────────────────────────────────────── */}
        <section className="mx-6 mb-24 rounded-[3rem] overflow-hidden relative bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80"
            alt="Sale"
            className="w-full h-[300px] object-cover opacity-30"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <span className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-4">Limited Time</span>
            <h2 className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-6">Mega Sale 🔥</h2>
            <p className="text-slate-300 mb-8 font-medium">Up to 50% off on selected pieces</p>
            <Link to="/shop?category=Sale" className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all inline-flex items-center gap-3">
              Shop Sale <Tag size={16} />
            </Link>
          </div>
        </section>

        {/* ── SHOP ALL CTA ─────────────────────────────────────────────── */}
        <section className="pb-24 max-w-[1440px] mx-auto px-6">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] block mb-3">Full Catalog</span>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter">More Picks</h2>
            </div>
            <Link to="/shop" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors pb-1 border-b-2 border-slate-100 hover:border-primary">
              Browse All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {loading
              ? [1,2,3,4].map(i => <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-[3rem]" />)
              : products.slice(4).map(p => (
                  <ProductCard key={p.id} {...p} category={p.categories?.name || 'Collection'} />
                ))
            }
          </div>
        </section>
        {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-24 border-t border-slate-100">
          <div className="max-w-[1440px] mx-auto px-6 text-center">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Real Reviews</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter mb-16">Loved by Women Nationwide <Star className="inline-block text-amber-400 -mt-2" fill="currentColor" /></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-left"
                >
                  <div className="flex text-amber-400 mb-6">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed italic mb-8">"{t.text}"</p>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-sm">{t.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Verified Buyer</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};
