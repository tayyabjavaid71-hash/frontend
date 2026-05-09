import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { WishlistButton } from '../wishlist/WishlistButton';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../context/CurrencyContext';
import { logTikTokEvent } from '../../services/tiktokEventLogger';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
  old_price?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ id, title, price, image_url, category, old_price }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const discountPercent = old_price && old_price > price 
    ? Math.round(((old_price - price) / old_price) * 100) 
    : 0;

  return (
    <div className="group relative rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
      
      <div className="relative h-72 overflow-hidden bg-slate-50 block">
        <WishlistButton productId={id} productName={title} productPrice={price} />
        <Link to={`/product/${id}`}>
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
          <span className="px-3 py-1 w-fit bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 rounded-full shadow-sm">
            {category}
          </span>
          {discountPercent > 0 && (
            <span className="px-3 py-1 w-fit bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm shadow-red-500/20">
              -{discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-2">
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <div className="flex items-end justify-between mt-2">
          <div className="flex flex-col">
            {discountPercent > 0 && (
              <span className="text-xs text-slate-400 line-through font-bold">{formatPrice(old_price!)}</span>
            )}
            <p className="text-lg font-black text-slate-900">{formatPrice(price)}</p>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.preventDefault();
              addToCart({ id, title, price, image_url, quantity: 1 });
              logTikTokEvent({ eventName: 'AddToCart', productId: id, productName: title, value: price, currency: 'PKR' });
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-primary hover:text-white transition-colors"
          >
            <ShoppingBag size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

