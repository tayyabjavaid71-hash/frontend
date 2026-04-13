import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/product/ProductCard';
import { ProductFilters } from '../components/product/ProductFilters';
import { useSearch } from '../hooks/useSearch';
import { useProducts } from '../hooks/useProducts';

export const ProductsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch(400);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || '';
    setCategory(cat);
  }, [location.search]);

  useEffect(() => {
    fetchProducts(debouncedSearch, category, minPrice, maxPrice);
  }, [debouncedSearch, category, minPrice, maxPrice]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-16 w-full">
        
        {/* HEADER SECTION */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-xl">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Boutique Gallery</span>
              <h1 className="text-6xl font-black text-slate-800 tracking-tighter mb-4">Curated Selection</h1>
              <p className="text-slate-400 font-medium text-lg">Explore our finest artisanal pieces, crafted for the modern luxury aesthetic.</p>
            </div>
            
            <div className="relative w-full md:max-w-md group">
              <input 
                type="text" 
                placeholder="Search collection..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 relative">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32 h-fit">
            <div className="flex items-center gap-3 mb-8 text-slate-800">
                <SlidersHorizontal size={18} />
                <span className="font-black uppercase text-xs tracking-widest">Filter By</span>
            </div>
            <ProductFilters 
              category={category}
              setCategory={setCategory}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          </aside>

          {/* MOBILE FILTER TOGGLE */}
          <div className="lg:hidden flex items-center justify-between py-4 border-y border-slate-100 mb-8">
            <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-slate-800"
            >
                <Filter size={16} /> Show Filters
            </button>
            <span className="text-[10px] font-black uppercase text-slate-400">{products.length} Products</span>
          </div>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[500px] bg-slate-50 animate-pulse rounded-[3rem]" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
              >
                <AnimatePresence>
                    {products.map(p => (
                      <ProductCard key={p.id} {...p} />
                    ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[4rem] border border-dashed border-slate-200"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <Search size={32} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">No matching pieces</h3>
                <p className="text-slate-400 font-medium max-w-sm mb-10">We couldn't find any products matching your current filters. Try adjusting your search.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setCategory(''); setMinPrice(undefined); setMaxPrice(undefined); }}
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </div>
        </div>

      </main>

      {/* MOBILE FILTERS DRAWER */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                />
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-x-0 bottom-0 bg-white rounded-t-[3rem] z-[110] p-10 max-h-[80vh] overflow-y-auto"
                >
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-slate-800 uppercase text-xs tracking-widest">Filters</h2>
                        <button onClick={() => setIsMobileFiltersOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center"><Filter size={16}/></button>
                    </div>
                    <ProductFilters 
                        category={category}
                        setCategory={setCategory}
                        minPrice={minPrice}
                        setMinPrice={setMinPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                    />
                    <button 
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-12"
                    >
                        Apply Filters
                    </button>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};
