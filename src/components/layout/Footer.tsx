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

          {/* ── Download Our App ── */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-5">Download Our App</h4>
            <div className="flex flex-col gap-3">
              {/* Google Play */}
              <a href="#" className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors w-fit">
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                  <path d="M3.18 23.76c.33.18.7.24 1.07.17l12.12-12.12-3.16-3.16-10.03 15.11zm15.76-14.04l-2.1-1.21-3.35 3.35 3.35 3.35 2.12-1.22c.6-.35.97-.97.97-1.64 0-.67-.37-1.29-.99-1.63zm-14.91-8.5c-.07.12-.1.26-.1.41v18.74c0 .15.03.29.1.41l.08.07 10.49-10.49v-.23L4.11 1.15l-.08.07zm2.43-.6L18.6 7.38l-3.16 3.16L3.37.59c.35-.2.77-.2 1.09.03z"/>
                </svg>
                <div>
                  <div className="text-[10px] text-slate-300 leading-none">Get it on</div>
                  <div className="text-xs font-bold leading-tight mt-0.5">Google Play</div>
                </div>
              </a>
              {/* App Store */}
              <a href="#" className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors w-fit">
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-[10px] text-slate-300 leading-none">Download on the</div>
                  <div className="text-xs font-bold leading-tight mt-0.5">App Store</div>
                </div>
              </a>
            </div>
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
