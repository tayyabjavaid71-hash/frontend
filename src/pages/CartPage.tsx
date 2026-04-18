import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck, Package } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../context/CurrencyContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const shipping = cartTotal > 500 ? 0 : 50;
  const total = cartTotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag size={48} className="text-slate-200" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-4">Your Bag is Empty</h1>
          <p className="text-slate-500 mb-10 max-w-sm">
            Discover our latest collection and start building your luxury wardrobe today.
          </p>
          <Link to="/shop" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">
            Explore Collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-360 mx-auto px-6 py-16 w-full">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Left: Cart Items */}
          <div className="flex-1">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-3 block">Shopping Bag</span>
                <h1 className="text-5xl font-black text-slate-800 tracking-tight">Your Selection</h1>
              </div>
              <p className="text-slate-400 font-bold mb-1">{cart.length} Items</p>
            </div>

            <div className="space-y-10">
              {cart.map((item) => (
                <motion.div 
                  layout
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex flex-col sm:flex-row gap-8 pb-10 border-b border-slate-100 group"
                >
                  <div className="w-full sm:w-40 h-52 rounded-4xl overflow-hidden bg-slate-50 shrink-0">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">{item.title}</h3>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                          {item.selectedSize} / {item.selectedColor}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize!, item.selectedColor!, item.cart_id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="mt-auto flex justify-between items-end pt-6">
                      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize!, item.selectedColor!, item.cart_id, Math.max(1, item.quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:scale-110 transition-transform"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-black text-slate-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize!, item.selectedColor!, item.cart_id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:scale-110 transition-transform"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Item Total</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Summary Card */}
          <div className="w-full lg:w-112.5">
            <div className="bg-slate-50 p-12 rounded-[3.5rem] sticky top-32 border border-slate-100">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 border-b border-slate-200 pb-6">Summary</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Subtotal</span>
                  <span className="font-black text-slate-800">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Shipping</span>
                    <Truck size={14} className="text-primary" />
                  </div>
                  <span className="font-black text-slate-800">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-slate-400 font-bold italic">Free shipping on orders over PKR 500</p>
                )}
              </div>

              <div className="pt-8 border-t border-slate-200 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800">Total</span>
                  <span className="text-4xl font-black text-primary tracking-tighter">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <ShieldCheck size={16} className="text-green-500" />
                  Secure Transaction
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Package size={16} className="text-primary" />
                  Cash On Delivery Available
                </div>
              </div>

              <Link to="/checkout" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:bg-black group">
                Proceed to Checkout <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
