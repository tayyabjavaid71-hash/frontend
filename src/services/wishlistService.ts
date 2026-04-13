import { supabase } from './supabaseClient';

export const wishlistService = {
  async fetchWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  async toggleWishlist(userId: string, productId: string) {
    // Check if exists
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return { action: 'removed' };
    } else {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id: productId });
      if (error) throw error;
      return { action: 'added' };
    }
  }
};
