import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

interface WishlistButtonProps {
  productId: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ productId }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const isWished = wishlist.includes(productId);

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.1 }}
      onClick={(e) => {
        e.preventDefault(); // prevent triggering parent Link if nested
        toggleWishlist(productId);
      }}
      className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-sm backdrop-blur-md transition-colors ${
        isWished ? 'bg-pink-500 text-white' : 'bg-white/80 text-slate-400 hover:text-pink-500'
      }`}
    >
      <Heart size={20} fill={isWished ? 'currentColor' : 'none'} className={isWished ? 'animate-pulse' : ''} />
    </motion.button>
  );
};
