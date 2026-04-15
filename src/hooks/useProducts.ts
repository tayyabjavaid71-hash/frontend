import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// Categories that are NOT women's clothing — excluded when womenOnly=true
const NON_WOMENS_CATEGORIES = ['Men', 'Boys', 'Kids', 'Accessories', 'Footwear'];

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (search = '', categoryId = '', minPrice?: number, maxPrice?: number, womenOnly = false) => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*, categories(name)');
      
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }
      
      if (categoryId) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
        if (isUUID) {
          query = query.eq('category_id', categoryId);
        } else {
          query = supabase
            .from('products')
            .select('*, categories!inner(name)')
            .ilike('categories.name', categoryId);
        }
      }
      
      if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
      }
      
      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      let result = data || [];

      // Filter to women's clothes only when requested
      if (womenOnly && !categoryId) {
        result = result.filter((p: any) => {
          const catName: string = p.categories?.name || '';
          return !NON_WOMENS_CATEGORIES.some(nc =>
            catName.toLowerCase().includes(nc.toLowerCase())
          );
        });
      }

      setProducts(result);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, fetchProducts };
};
