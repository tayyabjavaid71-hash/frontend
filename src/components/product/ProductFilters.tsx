import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';

interface ProductFiltersProps {
  category: string;
  setCategory: (c: string) => void;
  minPrice: number | undefined;
  setMinPrice: (p: number | undefined) => void;
  maxPrice: number | undefined;
  setMaxPrice: (p: number | undefined) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice 
}) => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24"
    >
      <h3 className="font-bold text-lg text-slate-800 mb-6 pb-4 border-b border-slate-100">Filters</h3>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Category</h4>
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => setCategory('')}
              className={`text-sm w-full text-left transition-colors ${
                category === '' ? 'text-primary font-semibold' : 'text-slate-500 hover:text-primary'
              }`}
            >
              All Collections
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button 
                onClick={() => setCategory(cat.id)}
                className={`text-sm w-full text-left transition-colors ${
                  category === cat.id ? 'text-primary font-semibold' : 'text-slate-500 hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Price Range</h4>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            value={minPrice || ''}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-slate-400">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            value={maxPrice || ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>
    </motion.div>
  );
};
