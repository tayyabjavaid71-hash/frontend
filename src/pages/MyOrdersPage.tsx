import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Edit2, X, Download, Loader2, AlertCircle,
  Check, ChevronDown, ChevronUp, MapPin, Phone,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import type { Order } from '../types';

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
};

interface EditForm {
  address: string;
  phone: string;
  city: string;
}

export const MyOrdersPage: React.FC = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext)!;
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<EditForm>({ address: '', phone: '', city: '' });
  const [saving, setSaving]       = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    orderApi.getMine()
      .then(res => setOrders(res.data?.orders || []))
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const openEdit = (order: Order) => {
    setEditingId(order.id);
    setEditForm({ address: order.address || '', phone: order.phone || '', city: order.city || '' });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await orderApi.update(editingId, editForm);
      setOrders(prev => prev.map(o => o.id === editingId ? { ...o, ...res.data.order } : o));
      setEditingId(null);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update order.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    setError(null);
    try {
      await orderApi.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as any } : o));
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const canModify = (status: string) => ['pending', 'confirmed'].includes(status);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <span className="text-primary font-black uppercase tracking-widest text-[10px] block mb-3">Account</span>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight">My Orders</h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6 text-red-700"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={40} className="animate-spin text-slate-300" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Package size={32} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">No orders yet</h2>
            <p className="text-slate-500 mb-8">Start shopping to see your orders here.</p>
            <Link
              to="/shop"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div
                key={order.id}
                layout
                className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden"
              >
                {/* ── Order Header ─────────────────────────────────────────── */}
                <div
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  onClick={() => setExpandedId(prev => prev === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Package size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800">#{order.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[order.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {order.status}
                    </span>
                    <span className="font-black text-slate-800">
                      {order.currency || 'PKR'} {Number(order.total_amount || 0).toLocaleString()}
                    </span>
                    {expandedId === order.id
                      ? <ChevronUp size={18} className="text-slate-400" />
                      : <ChevronDown size={18} className="text-slate-400" />
                    }
                  </div>
                </div>

                {/* ── Expanded Content ─────────────────────────────────────── */}
                <AnimatePresence>
                  {expandedId === order.id && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 overflow-hidden"
                    >
                      <div className="p-6 space-y-6">

                        {/* Shipping info / edit form */}
                        {editingId === order.id ? (
                          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Edit Shipping Details</p>
                            <input
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-primary text-sm"
                              placeholder="Street Address"
                              value={editForm.address}
                              onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-primary text-sm"
                                placeholder="City"
                                value={editForm.city}
                                onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                              />
                              <input
                                className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-primary text-sm"
                                placeholder="Phone"
                                value={editForm.phone}
                                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                              >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                              >
                                <X size={14} /> Discard
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <MapPin size={16} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Address</p>
                                <p className="font-bold text-slate-700 text-sm">{order.address}, {order.city}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Phone size={16} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone</p>
                                <p className="font-bold text-slate-700 text-sm">{order.phone}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        {order.order_items && order.order_items.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                              Items ({order.order_items.length})
                            </p>
                            <div className="space-y-2">
                              {order.order_items.map(item => (
                                <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                                  {item.products?.image_url && (
                                    <img
                                      src={item.products.image_url}
                                      alt={item.products.title}
                                      className="w-12 h-14 object-cover rounded-lg shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{item.products?.title || 'Product'}</p>
                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-black text-slate-800 text-sm shrink-0">
                                    {order.currency || 'PKR'} {Number((item.price_at_purchase ?? item.price ?? 0) * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                          <a
                            href={`/api/orders/${order.id}/invoice`}
                            download={`JT-Invoice-${order.id.substring(0, 8).toUpperCase()}.pdf`}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                          >
                            <Download size={14} /> Invoice
                          </a>

                          {canModify(order.status) && editingId !== order.id && (
                            <button
                              onClick={e => { e.stopPropagation(); openEdit(order); }}
                              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                          )}

                          {canModify(order.status) && (
                            <button
                              onClick={e => { e.stopPropagation(); handleCancel(order.id); }}
                              disabled={cancellingId === order.id}
                              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                            >
                              {cancellingId === order.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <X size={14} />
                              }
                              Cancel
                            </button>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
