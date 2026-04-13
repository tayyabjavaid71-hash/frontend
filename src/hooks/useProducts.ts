import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (search = '', categoryId = '', minPrice?: number, maxPrice?: number) => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*, categories(name)');
      
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }
      
      if (categoryId) {
        // Check if categoryId is a UUID or a name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
        if (isUUID) {
          query = query.eq('category_id', categoryId);
        } else {
          // If it's a name (from URL), we need to filter on categories.name
          // We use 'categories!inner(name)' to force the join and filter by the nested property
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
      if (data) setProducts(data);
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
