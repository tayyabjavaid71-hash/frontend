import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { CartItem } from '../types';

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string, size?: string, color?: string, cart_id?: string) => Promise<void>;
  updateQuantity: (id: string, size: string | undefined, color: string | undefined, cart_id: string | undefined, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  cartTotal: number;
  cartCount: number;
  fetchCart: () => Promise<void>;
  error: string | null;
}

export const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jt_brand_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('jt_brand_cart');
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('cart')
        .select('*, products(id, title, price, image_url, stock)')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching cart:', fetchError);
        setError('Failed to fetch cart');
        return;
      }

      if (data) {
        const items = data.map((item: any) => ({
          id: item.products.id,
          title: item.products.title,
          price: item.products.price,
          image_url: item.products.image_url,
          stock: item.products.stock,
          quantity: item.quantity,
          selectedSize: item.selected_size,
          selectedColor: item.selected_color,
          variationId: item.variation_id,
        } as CartItem));
        setCart(items);
      }
    } catch (err) {
      console.error('Error in fetchCart:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jt_brand_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [cart]);

  const addToCart = useCallback(async (item: CartItem) => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        // Check if item already in DB
        const { data: existing, error: queryError } = await supabase
          .from('cart')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', item.id)
          .eq('selected_size', item.selectedSize || '')
          .eq('selected_color', item.selectedColor || '')
          .single();

        if (queryError && queryError.code !== 'PGRST116') {
          console.error('Error checking existing cart item:', queryError);
          throw queryError;
        }

        if (existing) {
          // Update quantity
          const { error: updateError } = await supabase
            .from('cart')
            .update({ quantity: existing.quantity + (item.quantity || 1) })
            .eq('id', existing.id);

          if (updateError) throw updateError;
        } else {
          // Insert new item
          const { error: insertError } = await supabase.from('cart').insert({
            user_id: user.id,
            product_id: item.id,
            quantity: item.quantity || 1,
            selected_size: item.selectedSize || '',
            selected_color: item.selectedColor || '',
          });

          if (insertError) throw insertError;
        }

        await fetchCart();
      } else {
        // Local cart (no user logged in)
        setCart(prev => {
          const existing = prev.find(
            p =>
              p.id === item.id &&
              p.selectedSize === item.selectedSize &&
              p.selectedColor === item.selectedColor
          );

          if (existing) {
            return prev.map(p =>
              p.id === item.id &&
              p.selectedSize === item.selectedSize &&
              p.selectedColor === item.selectedColor
                ? { ...p, quantity: p.quantity + (item.quantity || 1) }
                : p
            );
          }

          return [...prev, { ...item, quantity: item.quantity || 1 }];
        });
      }

      setIsCartOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(message);
      console.error('Error in addToCart:', err);
      throw err;
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(
    async (id: string, size?: string, color?: string, cart_id?: string) => {
      try {
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && cart_id) {
          const { error: deleteError } = await supabase
            .from('cart')
            .delete()
            .eq('id', cart_id);

          if (deleteError) throw deleteError;
          await fetchCart();
        } else {
          setCart(prev =>
            prev.filter(
              p =>
                !(
                  p.id === id &&
                  p.selectedSize === size &&
                  p.selectedColor === color
                )
            )
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove item';
        setError(message);
        console.error('Error in removeFromCart:', err);
        throw err;
      }
    },
    [fetchCart]
  );

  const updateQuantity = useCallback(
    async (
      id: string,
      size: string | undefined,
      color: string | undefined,
      cart_id: string | undefined,
      quantity: number
    ) => {
      try {
        if (quantity < 1) {
          await removeFromCart(id, size, color, cart_id);
          return;
        }

        setError(null);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && cart_id) {
          const { error: updateError } = await supabase
            .from('cart')
            .update({ quantity })
            .eq('id', cart_id);

          if (updateError) throw updateError;
          await fetchCart();
        } else {
          setCart(prev =>
            prev.map(p =>
              p.id === id && p.selectedSize === size && p.selectedColor === color
                ? { ...p, quantity }
                : p
            )
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update quantity';
        setError(message);
        console.error('Error in updateQuantity:', err);
        throw err;
      }
    },
    [fetchCart, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { error: deleteError } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', session.user.id);

        if (deleteError) throw deleteError;
      }

      setCart([]);
      localStorage.removeItem('jt_brand_cart');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(message);
      console.error('Error in clearCart:', err);
      throw err;
    }
  }, []);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartCount,
        fetchCart,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
