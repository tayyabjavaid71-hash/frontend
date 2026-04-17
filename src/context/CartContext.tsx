import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { API } from '../services/api';
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

const LS_KEY = 'jt_brand_cart';
const loadLocal = (): CartItem[] => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const saveLocal = (cart: CartItem[]) => { try { localStorage.setItem(LS_KEY, JSON.stringify(cart)); } catch {} };

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(loadLocal);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { saveLocal(cart); }, [cart]);

  const fetchCart = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await API.get('/cart');
      const rows: CartItem[] = (data || []).map((row: any) => ({
        id:            row.products?.id    ?? row.product_id,
        title:         row.products?.title ?? '',
        price:         row.products?.price ?? 0,
        image_url:     row.products?.image_url ?? '',
        stock:         row.products?.stock,
        quantity:      row.quantity,
        selectedSize:  row.selected_size  ?? undefined,
        selectedColor: row.selected_color ?? undefined,
        cart_id:       row.id,
      }));
      setCart(rows);
    } catch { /* keep local cart on network error */ }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (item: CartItem) => {
    setCart(prev => {
      const match = (p: CartItem) =>
        p.id === item.id &&
        (p.selectedSize ?? null) === (item.selectedSize ?? null) &&
        (p.selectedColor ?? null) === (item.selectedColor ?? null);
      const existing = prev.find(match);
      if (existing) return prev.map(p => match(p) ? { ...p, quantity: p.quantity + (item.quantity || 1) } : p);
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    setIsCartOpen(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: row } = await API.post('/cart', {
        product_id:     item.id,
        quantity:       item.quantity || 1,
        selected_size:  item.selectedSize  || null,
        selected_color: item.selectedColor || null,
      });
      if (row?.id) {
        setCart(prev => prev.map(p =>
          p.id === item.id &&
          (p.selectedSize ?? null) === (item.selectedSize ?? null) &&
          (p.selectedColor ?? null) === (item.selectedColor ?? null)
            ? { ...p, cart_id: row.id } : p
        ));
      }
    } catch (err: any) {
      console.warn('[Cart] DB sync failed (local cart still works):', err?.response?.data || err?.message);
    }
  }, []);

  const removeFromCart = useCallback(async (id: string, size?: string, color?: string, cart_id?: string) => {
    setCart(prev => prev.filter(p =>
      !(p.id === id && (p.selectedSize ?? undefined) === size && (p.selectedColor ?? undefined) === color)
    ));
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !cart_id) return;
      await API.delete(`/cart/${cart_id}`);
    } catch (err: any) {
      console.warn('[Cart] remove sync failed:', err?.response?.data || err?.message);
    }
  }, []);

  const updateQuantity = useCallback(async (
    id: string, size: string | undefined, color: string | undefined,
    cart_id: string | undefined, quantity: number
  ) => {
    if (quantity < 1) { await removeFromCart(id, size, color, cart_id); return; }
    setCart(prev => prev.map(p =>
      p.id === id && (p.selectedSize ?? undefined) === size && (p.selectedColor ?? undefined) === color
        ? { ...p, quantity } : p
    ));
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !cart_id) return;
      await API.put(`/cart/${cart_id}`, { quantity });
    } catch (err: any) {
      console.warn('[Cart] update sync failed:', err?.response?.data || err?.message);
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    localStorage.removeItem(LS_KEY);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await API.delete('/cart');
    } catch (err: any) {
      console.warn('[Cart] clear sync failed:', err?.response?.data || err?.message);
    }
  }, []);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      isCartOpen, setIsCartOpen, cartTotal, cartCount, fetchCart, error,
    }}>
      {children}
    </CartContext.Provider>
  );
};
