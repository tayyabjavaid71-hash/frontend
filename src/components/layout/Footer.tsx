import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-5">
              <img src="/logo.png" alt="JT Collections" className="h-24 w-auto object-contain" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Premium women's fashion for every occasion. Discover modern luxury seamlessly designed for your aesthetic.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Shop</h4>
            <ul className="space-y-3">
              {['New Arrivals', 'Dresses', 'Abaya', 'Accessories'].map((item) => (
                <li key={item}>
                  <Link to={`/shop?category=${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Help</h4>
            <ul className="space-y-3 font-medium text-sm text-slate-400">
              <li className="cursor-pointer hover:text-amber-400 transition-colors">Shipping & Returns</li>
              <li className="cursor-pointer hover:text-amber-400 transition-colors">Track Order</li>
              <li className="cursor-pointer hover:text-amber-400 transition-colors">Size Guide</li>
              <li className="cursor-pointer hover:text-amber-400 transition-colors">FAQ</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Email: support@jtcollections.com</li>
              <li>Phone: +92 300 1234567</li>
              <li className="pt-2">Lahore, Pakistan</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JT Collections" className="h-10 w-auto object-contain opacity-80" />
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} JT Collections. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
