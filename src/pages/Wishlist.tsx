import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/product/ProductCard';
import { useWishlist } from '../hooks/useWishlist';
import { useProducts } from '../hooks/useProducts';
import { HeartCrack } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Wishlist: React.FC = () => {
  const { wishlist } = useWishlist();
  const { products } = useProducts();
  
  const savedProducts = products.filter((p: any) => wishlist.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-4xl font-black text-slate-800 mb-2">My Wishlist ❤️</h1>
        <p className="text-slate-500 mb-10">Keep track of your favorite collections in one place.</p>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedProducts.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-16 border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-6">
              <HeartCrack size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Your wishlist is empty!</h2>
            <p className="text-slate-500 mb-8 max-w-md">Looks like you haven't saved any items yet. Explore our shop and tap the heart icon to save items here.</p>
            <Link to="/shop" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-colors">
              Explore Collections
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
