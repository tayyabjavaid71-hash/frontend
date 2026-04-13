import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]); // product IDs
  
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', session.user.id);
      if (data) {
        setWishlist(data.map(w => w.product_id));
      }
    } else {
      const saved = localStorage.getItem('jt_wishlist');
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing wishlist from localStorage:', error);
          setWishlist([]);
          localStorage.removeItem('jt_wishlist'); // Clear corrupted data
        }
      }
    }
  };

  const toggleWishlist = async (productId: string) => {
    let updated;
    const isWished = wishlist.includes(productId);
    
    if (isWished) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    
    setWishlist(updated);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        if (isWished) {
          await supabase.from('wishlist').delete().eq('product_id', productId).eq('user_id', session.user.id);
        } else {
          await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: productId });
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        localStorage.setItem('jt_wishlist', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  };

  return { wishlist, toggleWishlist };
};
