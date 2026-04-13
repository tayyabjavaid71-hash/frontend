import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-black text-slate-800 tracking-tight block mb-6">
              JT <span className="text-primary">Collections</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Premium women's fashion for every occasion. Discover modern luxury seamlessly designed for your aesthetic.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Shop</h4>
            <ul className="space-y-3">
              {['New Arrivals', 'Dresses', 'Abaya', 'Accessories'].map((item) => (
                <li key={item}>
                  <Link to={`/shop?category=${item.toLowerCase()}`} className="text-sm text-slate-500 hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Help</h4>
            <ul className="space-y-3 font-medium text-sm text-slate-500">
              <li className="cursor-pointer hover:text-primary transition-colors">Shipping & Returns</li>
              <li className="cursor-pointer hover:text-primary transition-colors">Track Order</li>
              <li className="cursor-pointer hover:text-primary transition-colors">Size Guide</li>
              <li className="cursor-pointer hover:text-primary transition-colors">FAQ</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>Email: support@jtcollections.com</li>
              <li>Phone: +92 300 1234567</li>
              <li className="pt-2">Lahore, Pakistan</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} JT Collections. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
