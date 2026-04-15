import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap, Star, ShieldCheck, Truck, ChevronDown, Info } from 'lucide-react';
import { WishlistButton } from '../wishlist/WishlistButton';
import { productService, calculateFinalPrice } from '../../services/productService';
import type { ProductVariation } from '../../services/productService';

// SRS Size Chart
const SIZE_CHART = [
  { size: 'XS', chest: 32, waist: 26, hip: 34 },
  { size: 'S',  chest: 34, waist: 28, hip: 36 },
  { size: 'M',  chest: 36, waist: 30, hip: 38 },
  { size: 'L',  chest: 38, waist: 32, hip: 40 },
  { size: 'XL', chest: 40, waist: 34, hip: 42 },
  { size: 'XXL',chest: 42, waist: 36, hip: 44 },
];

interface ProductInfoProps {
  product: {
    id: string;
    title: string;
    price: number;
    discount_price?: number;
    old_price?: number;
    stock: number;
    sizes?: string[];
    colors?: string[];
    description?: string;
    image_url?: string;
    fabric?: string;
    work?: string;
    pieces?: number;
    includes?: string[];
  };
  onAddToCart: (product: Record<string, unknown>, variants: { size: string; color: string; quantity: number; variationId?: string }) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, onAddToCart }) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [loadingVariations, setLoadingVariations] = useState(true);

  // Fetch real variations from product_variations table
  useEffect(() => {
    const load = async () => {
      try {
        const vars = await productService.fetchVariations(product.id);
        setVariations(vars);

        // Default to first available size/color
        if (vars.length > 0) {
          setSelectedSize(vars[0].size);
          setSelectedColor(vars[0].color);
        } else {
          // Fallback to product-level arrays
          setSelectedSize(product.sizes?.[0] || '');
          setSelectedColor(product.colors?.[0] || '');
        }
      } catch {
        setSelectedSize(product.sizes?.[0] || 'M');
        setSelectedColor(product.colors?.[0] || '');
      } finally {
        setLoadingVariations(false);
      }
    };
    load();
  }, [product.id, product.sizes, product.colors]);

  // Find the active variation for the selected size + color
  const activeVariation = variations.find(v => v.size === selectedSize && v.color === selectedColor)
    ?? variations.find(v => v.size === selectedSize)
    ?? null;

  // SRS Price Logic: Final Price = Base Price + Size Adjustment - Discount
  const priceAdjustment = activeVariation?.price_adjustment ?? 0;
  const finalPrice = calculateFinalPrice(product.price, priceAdjustment, product.discount_price);
  const displayBase = product.discount_price ?? product.price;
  const discount = product.old_price && product.old_price > displayBase ? product.old_price - displayBase : 0;

  // Stock from variation if available, else from product
  const availableStock = activeVariation?.stock ?? product.stock;
  const isLowStock = availableStock > 0 && availableStock <= 5;
  const isOutOfStock = availableStock === 0;

  // Unique sizes/colors from variations
  const varSizes = [...new Set(variations.map(v => v.size))];
  const varColors = [...new Set(variations.map(v => v.color))];
  const displaySizes = varSizes.length > 0 ? varSizes : (product.sizes || []);
  const displayColors = varColors.length > 0 ? varColors : (product.colors || []);

  // Check if a size has stock in any color variation
  const sizeHasStock = (size: string) => {
    if (variations.length === 0) return true;
    return variations.some(v => v.size === size && v.stock > 0);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(
      { ...product, price: finalPrice },
      { size: selectedSize, color: selectedColor, quantity, variationId: activeVariation?.id }
    );
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-primary font-black tracking-widest uppercase text-xs mb-3 block">JT Collections Boutique</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">{product.title}</h1>
        </div>
        <WishlistButton productId={product.id} />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 text-amber-400">
          {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <span className="text-slate-400 font-bold text-sm">4.9 (128 Reviews)</span>
      </div>

      {/* Price — shows adjustment for selected size */}
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-black text-slate-900">
          PKR {finalPrice.toLocaleString()}
        </span>
        {product.old_price && product.old_price > displayBase && (
          <>
            <span className="text-xl text-slate-400 line-through font-bold">PKR {product.old_price.toLocaleString()}</span>
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Save PKR {discount.toLocaleString()}</span>
          </>
        )}
        {priceAdjustment > 0 && (
          <span className="text-amber-600 text-xs font-black uppercase tracking-widest">+PKR {priceAdjustment} for {selectedSize}</span>
        )}
      </div>

      {/* Stock Alert */}
      <AnimatePresence>
        {isOutOfStock ? (
          <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest bg-red-50 px-4 py-3 rounded-xl w-fit">
            ❌ Out of Stock
          </motion.div>
        ) : isLowStock ? (
          <motion.div key="low" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl w-fit">
            <Zap size={14} /> Only {availableStock} left — Order soon!
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Product Specs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fabric</p>
          <p className="text-sm font-bold text-slate-800">{product.fabric || 'Premium Blend'}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Work</p>
          <p className="text-sm font-bold text-slate-800">{product.work || 'Detailed Finish'}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pieces</p>
          <p className="text-sm font-bold text-slate-800">{product.pieces || 1} Piece</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Includes</p>
          <p className="text-sm font-bold text-slate-800">{Array.isArray(product.includes) && product.includes.length > 0 ? product.includes.join(', ') : 'Main Product'}</p>
        </div>
      </div>

      {/* Size Selector */}
      {displaySizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Select Size</h4>
            <button
              onClick={() => setShowSizeChart(!showSizeChart)}
              className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
            >
              <Info size={12} /> Size Guide <ChevronDown size={12} className={`transition-transform ${showSizeChart ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* SRS Size Chart */}
          <AnimatePresence>
            {showSizeChart && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4">
                <table className="w-full text-xs border-collapse bg-slate-50 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      {['Size', 'Chest', 'Waist', 'Hip'].map(h => (
                        <th key={h} className="py-2 px-3 text-left font-black uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART.map(row => (
                      <tr key={row.size} className={`border-b border-slate-100 ${selectedSize === row.size ? 'bg-primary/10 font-black' : ''}`}>
                        <td className="py-2 px-3 font-black">{row.size}</td>
                        <td className="py-2 px-3">{row.chest}"</td>
                        <td className="py-2 px-3">{row.waist}"</td>
                        <td className="py-2 px-3">{row.hip}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-3">
            {displaySizes.map(s => {
              const hasStock = sizeHasStock(s);
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  disabled={!hasStock}
                  className={`min-w-[56px] h-14 rounded-2xl flex items-center justify-center font-black transition-all border-2 relative ${
                    !hasStock ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                    : selectedSize === s
                      ? 'border-slate-800 bg-slate-900 text-white shadow-xl shadow-slate-300'
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {displayColors.length > 0 && (
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            Color — <span className="text-primary">{selectedColor}</span>
          </h4>
          <div className="flex flex-wrap gap-3">
            {displayColors.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
                  selectedColor === c
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shadow-inner border border-slate-200"
                  style={{ backgroundColor: c.toLowerCase() === 'white' ? '#fff' : c.toLowerCase() === 'black' ? '#000' : c.toLowerCase() === 'red' ? '#ef4444' : c.toLowerCase() === 'blue' ? '#3b82f6' : c.toLowerCase() === 'green' ? '#22c55e' : c.toLowerCase() === 'pink' ? '#ec4899' : c.toLowerCase() === 'beige' ? '#d4b896' : c.toLowerCase() === 'maroon' ? '#800000' : '#94a3b8' }}
                />
                <span className="font-black text-xs uppercase tracking-widest">{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-xl py-6 border-t border-slate-100 -mx-4 px-4 sm:mx-0 sm:px-0 z-20">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl h-16 w-full sm:w-40 border border-slate-200">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center font-black text-slate-500 hover:bg-white rounded-xl transition-all">-</button>
          <span className="flex-1 text-center font-black text-slate-800">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} className="w-12 h-full flex items-center justify-center font-black text-slate-500 hover:bg-white rounded-xl transition-all">+</button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || loadingVariations}
          className="flex-1 bg-primary text-white h-16 rounded-[1.5rem] font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={20} />
          {isOutOfStock ? 'Out of Stock' : `Add to Bag — PKR ${finalPrice.toLocaleString()}`}
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
          <Truck className="text-primary" size={24} />
          <div><h6 className="font-black text-[10px] uppercase tracking-widest">Fast Delivery</h6><p className="text-[10px] text-slate-500">Nationwide Express</p></div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
          <ShieldCheck className="text-primary" size={24} />
          <div><h6 className="font-black text-[10px] uppercase tracking-widest">Secure COD</h6><p className="text-[10px] text-slate-500">100% Guaranteed</p></div>
        </div>
      </div>
    </div>
  );
};
