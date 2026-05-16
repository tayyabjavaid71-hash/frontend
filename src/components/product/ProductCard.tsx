import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { WishlistButton } from '../wishlist/WishlistButton';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../context/CurrencyContext';
import { logTikTokEvent } from '../../services/tiktokEventLogger';
import { sendTikTokServerEvent } from '../../services/tiktokServerEvent';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
  old_price?: number;
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" className={`w-3 h-3 ${filled ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const ProductCard: React.FC<ProductCardProps> = ({ id, title, price, image_url, category, old_price }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const discountPercent = old_price && old_price > price 
    ? Math.round(((old_price - price) / old_price) * 100) 
    : 0;

  return (
    <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">

      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50 aspect-square">
        <WishlistButton productId={id} productName={title} productPrice={price} />
        <Link to={`/product/${id}`}>
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-sm text-slate-800 line-clamp-1 hover:text-indigo-600 transition-colors mb-0.5">
            {title}
          </h3>
        </Link>
        <p className="text-[11px] text-slate-400 mb-1.5">{category}</p>

        {/* Star ratings */}
        <div className="flex items-center gap-0.5 mb-2">
          {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= 4} />)}
          <span className="text-[10px] text-slate-400 ml-1">(1.2k)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-black text-slate-900 text-base">{formatPrice(price)}</span>
          {discountPercent > 0 && (
            <span className="text-xs text-slate-400 line-through">{formatPrice(old_price!)}</span>
          )}
        </div>

        {/* Add to Cart — full width */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.preventDefault();
            addToCart({ id, title, price, image_url, quantity: 1 });
            logTikTokEvent({ eventName: 'AddToCart', productId: id, productName: title, value: price, currency: 'PKR' });
            sendTikTokServerEvent({
              event_name: 'AddToCart',
              value: price,
              currency: 'PKR',
              contents: [{ content_id: id, content_type: 'product', content_name: title, quantity: 1, price }],
              num_items: 1,
              page_url: window.location.href,
            });
          }}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
        >
          <ShoppingCart size={13} />
          Add to Cart
        </motion.button>
      </div>
    </div>
  );
};

