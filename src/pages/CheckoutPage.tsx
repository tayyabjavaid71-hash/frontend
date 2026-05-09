import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, ShoppingBag, Home, CreditCard, Truck, Lock } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../hooks/useCart';
import { AuthContext } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';
import { useCurrency } from '../context/CurrencyContext';
import { trackPixelEvent } from '../utils/metaPixel';
import { sendMetaEvent } from '../services/metaEventService';
import { logTikTokEvent } from '../services/tiktokEventLogger';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'COD' | 'CARD';
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useContext(AuthContext)!;
  const { currency, setCurrency, formatPrice, convert } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'COD',
  });

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
          <h1 className="text-4xl font-black text-slate-800 mb-4">Cart is Empty</h1>
          <p className="text-slate-500 mb-10 max-w-sm">Add items to your cart before proceeding to checkout.</p>
          <Link to="/shop" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await orderApi.create({
        userId: user?.id,
        customer_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        total_amount: convert(total),
        currency,
        payment_method: formData.paymentMethod,
        status: 'pending',
        items: cart.map(item => ({
          product_id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          size: item.selectedSize,
          color: item.selectedColor,
        })),
      });

      const orderId = response.data?.id || response.data?.order?.id;
      if (orderId) {
        const tiktokContents = cart.map((i) => ({
          content_id: i.id,
          content_type: 'product',
          content_name: i.title,
          quantity: i.quantity,
          price: i.price,
        }));

        // Fire Purchase event (browser pixel + server CAPI)
        const purchaseEventId = trackPixelEvent('Purchase', {
          value: convert(total),
          content_ids: cart.map((i) => i.id),
          num_items: cart.length,
        });
        sendMetaEvent({
          event_name: 'Purchase',
          event_id: purchaseEventId,
          value: convert(total),
          currency,
          content_ids: cart.map((i) => i.id),
          num_items: cart.length,
          email: formData.email,   // hashed server-side for advanced matching
          phone: formData.phone,
        });

        // TikTok Pixel — PlaceAnOrder + Purchase
        await logTikTokEvent({
          eventName: 'PlaceAnOrder',
          productId: String(orderId),
          productName: cart.map((i) => i.title).join(', '),
          value: convert(total),
          currency,
          extraPayload: {
            contents: tiktokContents,
            num_items: cart.length,
          },
        });
        await logTikTokEvent({
          eventName: 'Purchase',
          productId: String(orderId),
          productName: cart.map((i) => i.title).join(', '),
          value: convert(total),
          currency,
          extraPayload: {
            contents: tiktokContents,
            num_items: cart.length,
          },
        });

        await clearCart();
        navigate(`/success?orderId=${orderId}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: Form (2/3) */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-12">
                <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-3 block">Secure Checkout</span>
                <h1 className="text-5xl font-black text-slate-800 tracking-tight">Complete Your Order</h1>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-8">
                {/* Error Message */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-red-700 font-semibold">{error}</p>
                  </motion.div>
                )}

                {/* Shipping Information Section */}
                <div className="border-t pt-8">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Home size={20} /> SHIPPING INFORMATION
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleInputChange} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-slate-800" />
                    <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleInputChange} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-slate-800" />
                    <input type="tel" name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleInputChange} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-slate-800" />
                    <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleInputChange} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-slate-800" />
                  </div>

                  <input type="text" name="address" placeholder="Street Address *" value={formData.address} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-slate-800 mt-6" />
                  <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-slate-800 mt-6" />
                </div>

                {/* Payment Method Section */}
                <div className="border-t pt-8">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <CreditCard size={20} /> PAYMENT METHOD
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-center p-5 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-primary transition-all" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}>
                      <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} className="w-5 h-5 accent-primary" />
                      <span className="ml-4 font-bold text-slate-800">Cash on Delivery (COD)</span>
                      <span className="ml-auto text-xs text-slate-500 font-semibold">Pay when item arrives</span>
                    </label>

                    <label className="flex items-center p-5 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-primary transition-all opacity-50 cursor-not-allowed" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CARD' }))}>
                      <input type="radio" name="paymentMethod" value="CARD" disabled className="w-5 h-5 accent-primary" />
                      <span className="ml-4 font-bold text-slate-800">Credit/Debit Card</span>
                      <span className="ml-auto text-xs text-slate-500 font-semibold">Coming Soon</span>
                    </label>
                  </div>
                </div>

                {/* Order Review Section */}
                <div className="border-t pt-8">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <ShoppingBag size={20} /> ORDER ITEMS ({cart.length})
                  </h2>

                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                          <div>
                            <p className="font-bold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.selectedSize} / {item.selectedColor}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">x{item.quantity}</p>
                          <p className="text-primary font-black">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50">
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={20} /> Place Order Securely
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Right: Order Summary (1/3) */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-32 bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 pb-6 border-b border-slate-200">Order Summary</h2>

              {/* Currency Selector */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Display Currency</p>
                <div className="flex gap-2">
                  {(['PKR', 'USD', 'AED'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-widest border-2 transition-all ${
                        currency === c
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <Truck size={14} /> Shipping
                  </span>
                  <span className="font-bold text-slate-800">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-slate-400 italic">Free shipping on orders over PKR 500</p>
                )}
              </div>

              <div className="pt-8 border-t border-slate-200 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800">Total</span>
                  <span className="text-4xl font-black text-primary tracking-tighter">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8 p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 text-xs text-green-700 font-bold">
                  <Check size={16} /> Secure checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-green-700 font-bold">
                  <Check size={16} /> Safe payment
                </div>
              </div>

              <Link to="/cart" className="w-full bg-white border border-slate-200 text-slate-800 py-3 rounded-2xl font-bold uppercase text-xs text-center hover:bg-slate-50 transition-all">
                Edit Cart
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
