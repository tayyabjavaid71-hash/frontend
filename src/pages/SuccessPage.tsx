import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Loader2, MapPin, Phone, Download } from 'lucide-react';
import type { Order } from '../types';
import { orderService } from '../services/orderService';

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await orderService.fetchOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={48} className="text-slate-800 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-black text-slate-800 mb-4">Oops!</h1>
          <p className="text-slate-500 mb-8">{error || 'Order not found'}</p>
          <Link to="/shop" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl w-full"
      >
        <div className="relative mb-12 text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                className="w-32 h-32 bg-slate-900 border-4 border-white shadow-2xl rounded-full flex items-center justify-center mx-auto"
            >
                <CheckCircle2 size={56} className="text-white" />
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-slate-100 rounded-full animate-ping opacity-20" />
        </div>
        
        <div className="text-center mb-16">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Boutique Confirmation</span>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-6">Your order is secured.</h1>
          <p className="text-slate-400 font-medium mb-4 max-w-md mx-auto leading-relaxed">
              Thank you for choosing JT Collections. Our artisans are now preparing your selection for delivery.
          </p>
          <p className="text-sm font-bold text-slate-500">
            Order confirmation has been sent to <span className="text-primary">{order.customer_name}</span>
          </p>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Reference</p>
                <p className="font-black text-slate-800 text-2xl tracking-tighter mb-6">#{order.id.substring(0, 8).toUpperCase()}</p>
                
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Date</p>
                <p className="font-bold text-slate-700 text-sm">{formatDate(order.created_at)}</p>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Payment Mode</p>
                <div className="flex items-center gap-2 mb-6">
                    <Package size={16} className="text-primary"/>
                    <p className="font-black text-slate-800 text-lg tracking-tighter uppercase">{order.payment_method || 'COD'}</p>
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Status</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-black uppercase tracking-widest">
                    <Truck size={14} />
                    {order.status}
                </div>
            </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 pb-4 border-b border-slate-100">Shipping To</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Truck size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient</p>
                <p className="font-black text-slate-800 text-lg">{order.customer_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</p>
                <p className="font-bold text-slate-700">{order.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</p>
                <p className="font-bold text-slate-700">{order.address}, {order.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 pb-4 border-b border-slate-100">Order Items ({order.order_items.length})</h3>
            
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="w-16 h-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    <img 
                      src={item.products?.image_url || ''} 
                      alt={item.products?.title || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800">{item.products?.title || 'Product'}</p>
                    <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-slate-800">Qty: {item.quantity}</p>
                    <p className="font-bold text-primary mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-800">Total</span>
                <span className="text-3xl font-black text-primary">${(order.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20 mb-12">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">What's Next?</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="font-black text-primary">1.</span>
              <span>Our team will confirm your order within 24 hours</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black text-primary">2.</span>
              <span>You'll receive a tracking link via SMS/Email</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black text-primary">3.</span>
              <span>Your items will be delivered within 3-5 working days</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/shop" className="group bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
            {orderId && (
              <a
                href={`/api/orders/${orderId}/invoice`}
                download={`JT-Invoice-${orderId.substring(0, 8).toUpperCase()}.pdf`}
                className="group bg-slate-100 text-slate-800 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
              >
                <Download size={18} />
                Download Invoice
              </a>
            )}
            <Link to="/my-orders" className="group border-2 border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-slate-400 transition-all flex items-center justify-center gap-3">
              My Orders
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
      </motion.div>
    </div>
  );
};
