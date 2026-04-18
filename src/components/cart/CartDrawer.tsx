import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { CartItem } from './CartItem';
import { useCurrency } from '../../context/CurrencyContext';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <ShoppingBag /> Your Cart
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-slate-500 text-sm">Looks like you haven't added anything yet.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-light transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => <CartItem key={item.id} item={item} />)
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-slate-800">{formatPrice(cartTotal)}</span>
                </div>
                <Link 
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
