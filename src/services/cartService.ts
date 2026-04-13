import { supabase } from './supabaseClient';

export const cartService = {
  async fetchCart(userId: string) {
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const { data, error } = await supabase
      .from('cart')
      .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id,product_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromCart(userId: string, productId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
};
