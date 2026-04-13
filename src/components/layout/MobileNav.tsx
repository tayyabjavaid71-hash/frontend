import React from 'react';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();
  const { profile } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home, exact: true },
    { name: 'Shop', path: '/shop', icon: Search, exact: false },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, exact: false },
    { name: 'Profile', path: profile ? '/admin' : '/login', icon: User, exact: false },
  ];

  const isActive = (path: string, exact: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe-area pt-safe-area">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group pointer-events-auto"
            >
              <div className={`transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}>
                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.name}
              </span>
              
              <AnimatePresence>
                {active && (
                  <motion.div 
                    layoutId="mobileNavIndicator"
                    className="absolute -top-3 w-1 h-1 bg-primary rounded-full shadow-sm shadow-primary/50"
                  />
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* Floating Cart Button in Center */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-14 h-14 bg-slate-900 border-4 border-white text-white rounded-full shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all outline-none"
        >
          <ShoppingBag size={20} strokeWidth={2.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </button>

      </div>
    </div>
  );
};
