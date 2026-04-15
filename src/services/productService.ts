import { supabase } from './supabaseClient';

// ── Types ─────────────────────────────────────────────────────────────────

export interface ProductQueryFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  color: string;
  size: string;
  stock: number;
  price_adjustment: number; // Final Price = base_price + price_adjustment - (base_price - old_price)
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

// ── SRS Price Logic ────────────────────────────────────────────────────────
// Final Price = Base Price + Size Adjustment - Discount
export function calculateFinalPrice(
  basePrice: number,
  priceAdjustment: number = 0,
  oldPrice?: number
): number {
  const discount = oldPrice && oldPrice > basePrice ? oldPrice - basePrice : 0;
  return Math.max(0, basePrice + priceAdjustment - discount);
}

// ── Product Service ────────────────────────────────────────────────────────

export const productService = {
  async fetchProducts(filters: ProductQueryFilters = {}) {
    let query = supabase
      .from('products')
      .select('*, categories(name, slug), subcategories(name, slug)')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async fetchProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), subcategories(name, slug), product_images(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch variations for a product (SRS: color, size, stock, price_adjustment)
  async fetchVariations(productId: string): Promise<ProductVariation[]> {
    const { data, error } = await supabase
      .from('product_variations')
      .select('*')
      .eq('product_id', productId)
      .order('size');

    if (error) throw error;
    return (data || []) as ProductVariation[];
  },

  // Fetch multiple images for a product
  async fetchProductImages(productId: string): Promise<ProductImage[]> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');

    if (error) throw error;
    return (data || []) as ProductImage[];
  },

  async fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Add a single variation to a product
  async addVariation(productId: string, variation: Omit<ProductVariation, 'id' | 'product_id'>): Promise<ProductVariation> {
    const { data, error } = await supabase
      .from('product_variations')
      .insert([{ product_id: productId, ...variation }])
      .select()
      .single();

    if (error) throw error;
    return data as ProductVariation;
  },

  // Delete a variation
  async deleteVariation(variationId: string): Promise<void> {
    const { error } = await supabase
      .from('product_variations')
      .delete()
      .eq('id', variationId);

    if (error) throw error;
  },

  // Reduce stock on a specific variation after order
  async reduceVariationStock(variationId: string, quantity: number): Promise<void> {
    const { data: v } = await supabase
      .from('product_variations')
      .select('stock')
      .eq('id', variationId)
      .single();

    if (v) {
      await supabase
        .from('product_variations')
        .update({ stock: Math.max(0, v.stock - quantity) })
        .eq('id', variationId);
    }
  },
};

// Named exports for admin panel compatibility
export const getProducts = productService.fetchProducts.bind(productService);
export const addProduct = (product: Record<string, unknown>) => supabase.from('products').insert([product]);
export const editProduct = (id: string, data: Record<string, unknown>) => supabase.from('products').update(data).eq('id', id);
export const removeProduct = (id: string) => supabase.from('products').delete().eq('id', id);
