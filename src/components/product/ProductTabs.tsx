import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductTabsProps {
  description?: string;
  fabric?: string;
  careInstructions?: string;
  includes?: string[];
  pieces?: number;
  work?: string;
  color?: string;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ description, fabric, careInstructions, includes, pieces, work, color }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'size'>('details');

  const tabs = [
    {
      id: 'details',
      label: 'Details',
      content: description || 'Premium craftsmanship meets modern luxury. This signature piece is designed for the discerning fashion enthusiast.'
    },
    {
      id: 'fabric',
      label: 'Fabric & Care',
      content: `${fabric || 'Premium blend'}${work ? ` · ${work}` : ''}. ${careInstructions || 'Hand wash cold, do not bleach.'}`
    },
    { id: 'size', label: 'Size Guide', content: 'True to size. For an oversized fit, we recommend sizing up one. Models are 180cm wearing size M.' },
  ] as const;

  return (
    <div className="mt-24 max-w-4xl mx-auto px-6">
      <div className="flex gap-12 border-b border-slate-100 mb-12 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative pb-6 text-sm font-black uppercase tracking-widest transition-colors ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[200px]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {tabs.find(t => t.id === activeTab)?.content}
              </p>
            </div>
            
            <div className="bg-slate-50 p-12 rounded-[3.5rem] flex flex-col justify-center border border-slate-100">
              <h5 className="font-black text-xs uppercase tracking-widest mb-4">Quality Promise</h5>
              <p className="text-slate-500 text-xs font-bold leading-loose">
                Every JT Collection piece undergoes rigorous quality control to ensure a perfect fit and long-lasting durability.
              </p>
              <div className="mt-5 text-[11px] text-slate-500 font-bold space-y-1">
                <p>Pieces: {pieces || 1}</p>
                <p>Includes: {includes && includes.length ? includes.join(', ') : 'Main Product'}</p>
                <p>Color Family: {color || 'As shown'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
