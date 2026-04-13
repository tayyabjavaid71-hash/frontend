import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when shifting to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-primary tracking-tight">
                JT <span className="text-accent">Collections</span>
              </Link>
            </div>

            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-slate-600 hover:text-accent transition-colors font-semibold">Home</Link>
              <Link to="/shop" className="text-slate-600 hover:text-accent transition-colors font-semibold">Shop</Link>
              <Link to="/shop?category=Women" className="text-slate-600 hover:text-accent transition-colors font-semibold">Women</Link>
              <Link to="/shop?category=Accessories" className="text-slate-600 hover:text-accent transition-colors font-semibold">Accessories</Link>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-5">
              <Link to="/shop" className="text-slate-600 hover:text-accent transition-colors">
                <Search size={22} />
              </Link>
              <Link to="/wishlist" className="hidden sm:block text-slate-600 hover:text-accent relative group transition-colors">
                <span className="sr-only">Wishlist</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              </Link>
              <button onClick={() => setIsCartOpen(true)} className="text-slate-600 hover:text-accent relative transition-colors">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {profile?.role === 'admin' && (
                <Link to="/admin" className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
              )}

              <Link to="/login" className="text-slate-600 hover:text-accent hidden sm:block transition-colors">
                <User size={22} />
              </Link>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-slate-600 hover:text-accent transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden sticky top-16 z-30"
          >
            <div className="flex flex-col px-4 py-6 space-y-4 shadow-inner">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 hover:text-accent">Home</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 hover:text-accent">Shop</Link>
              <Link to="/shop?category=Women" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 hover:text-accent">Women</Link>
              <Link to="/shop?category=Accessories" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 hover:text-accent">Accessories</Link>

              <div className="h-px bg-slate-100 my-2"></div>

              {profile?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-primary hover:text-accent flex items-center gap-2">
                  <LayoutDashboard size={20} />
                  Admin Dashboard
                </Link>
              )}

              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 hover:text-accent flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                Wishlist
              </Link>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-700 hover:text-accent flex items-center gap-2">
                <User size={20} />
                My Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
