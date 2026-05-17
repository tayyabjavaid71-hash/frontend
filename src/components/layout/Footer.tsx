import React from 'react';
import { Link } from 'react-router-dom';

const SocialIcon = ({ d, label }: { d: string; label: string }) => (
  <a href="#" aria-label={label} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d={d} />
    </svg>
  </a>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* ── Brand ── */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-5">
              <img src="/logo.png" alt="JT Collections" className="h-14 w-auto object-contain" />
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              Premium women's fashion for every occasion. Discover modern luxury designed for your aesthetic.
            </p>
            <div className="flex gap-2.5">
              <SocialIcon label="Facebook"  d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              <SocialIcon label="Instagram" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" />
              <SocialIcon label="Twitter"   d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              <SocialIcon label="YouTube"   d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM10 15V9l5.2 3-5.2 3z" />
            </div>
          </div>

          {/* ── Customer Service ── */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-5">Customer Service</h4>
            <ul className="space-y-3">
              {['Contact Us', 'FAQ', 'Shipping & Delivery', 'Returns & Refunds', 'Track Order'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us',          href: '#' },
                { label: 'Careers',           href: '#' },
                { label: 'Blog',              href: '#' },
                { label: 'Terms & Conditions', href: '#' },
                { label: 'Privacy Policy',    href: '/privacy-policy' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Popular Categories ── */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-5">Popular Categories</h4>
            <ul className="space-y-3">
              {['Unstitched', 'Kurtis', 'Abaya', 'Maxi', 'Western Wear'].map(item => (
                <li key={item}>
                  <Link to={`/shop?category=${encodeURIComponent(item)}`} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom strip ── */}
        <div className="border-t border-slate-100 mt-10 pt-6 text-center">
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} JT Collections. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
