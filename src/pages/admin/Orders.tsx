import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Calendar, CheckCircle2, ChevronDown, ChevronUp,
  CreditCard, Loader2, Mail, MapPin, Package, Phone, RefreshCw,
  ShoppingBag, Trash2, TrendingUp, XCircle,
} from 'lucide-react';
import { API } from '../../services/api';
import { supabase } from '../../services/supabaseClient';

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  products?: { title?: string; image_url?: string };
};

type Order = {
  id: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
  order_items?: OrderItem[];
};

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped:    'bg-purple-100 text-purple-800 border-purple-200',
  delivered:  'bg-green-100 text-green-800 border-green-200',
  cancelled:  'bg-red-100 text-red-800 border-red-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:    <Loader2 size={12} className="animate-spin" />,
  confirmed:  <CheckCircle2 size={12} />,
  processing: <Package size={12} />,
  shipped:    <TrendingUp size={12} />,
  delivered:  <CheckCircle2 size={12} />,
  cancelled:  <XCircle size={12} />,
};

// Valid next statuses — enforce forward-only flow
const NEXT_STATUSES: Record<string, string[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// ── Component ─────────────────────────────────────────────────────────────────
export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const { data } = await API.get('/admin/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Supabase realtime — auto-refresh when orders change
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      setError('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    setDeletingId(orderId);
    setConfirmDelete(null);
    try {
      await API.delete(`/admin/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (expandedId === orderId) setExpandedId(null);
    } catch {
      setError('Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped:    orders.filter(o => o.status === 'shipped').length,
    delivered:  orders.filter(o => o.status === 'delivered').length,
    revenue:    orders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
        </div>
        {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-pink-500 font-black uppercase tracking-[0.3em] text-[10px] block mb-1">Live · Auto-sync</span>
          <h1 className="text-4xl font-black text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total',      value: stats.total,                    color: 'bg-slate-100 text-slate-900' },
          { label: 'Pending',    value: stats.pending,                  color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Processing', value: stats.processing,               color: 'bg-indigo-100 text-indigo-800' },
          { label: 'Shipped',    value: stats.shipped,                  color: 'bg-purple-100 text-purple-800' },
          { label: 'Delivered',  value: stats.delivered,                color: 'bg-green-100 text-green-800' },
          { label: 'Revenue',    value: `$${stats.revenue.toFixed(0)}`, color: 'bg-pink-100 text-pink-800' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...ALL_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition ${
              filter === s
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* ── Orders list ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
          <ShoppingBag className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">No orders found</p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="mt-3 text-pink-500 text-sm font-semibold hover:underline">
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(order => {
              const isOpen = expandedId === order.id;
              const nextOpts = NEXT_STATUSES[order.status] || [];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* ── Summary row ── */}
                  <div className="p-5 flex flex-wrap items-center gap-4">

                    {/* ID + customer */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-slate-400">#{order.id?.slice(0, 8).toUpperCase()}</p>
                      <p className="font-black text-slate-900 text-lg leading-tight">{order.customer_name || 'Guest'}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                        {order.email && <span className="flex items-center gap-1"><Mail size={10}/>{order.email}</span>}
                        {order.phone && <span className="flex items-center gap-1"><Phone size={10}/>{order.phone}</span>}
                        {order.created_at && <span className="flex items-center gap-1"><Calendar size={10}/>{new Date(order.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Total</p>
                      <p className="text-xl font-black text-slate-900">${Number(order.total_amount || 0).toFixed(2)}</p>
                    </div>

                    {/* Status badge */}
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {STATUS_ICONS[order.status]}
                        {order.status}
                      </span>
                    </div>

                    {/* Next-status action buttons (forward-only) */}
                    {nextOpts.length > 0 && (
                      <div className="flex items-center gap-2">
                        {nextOpts.map(next => (
                          <button
                            key={next}
                            onClick={() => handleStatusChange(order.id, next)}
                            disabled={updatingId === order.id}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition disabled:opacity-50 ${
                              next === 'cancelled'
                                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {updatingId === order.id ? <Loader2 size={11} className="animate-spin" /> : `→ ${next}`}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Delete + expand */}
                    <div className="flex items-center gap-1">
                      {confirmDelete === order.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={deletingId === order.id}
                            className="px-2 py-1.5 rounded-xl text-[11px] font-black bg-red-500 text-white hover:bg-red-600 transition"
                          >
                            {deletingId === order.id ? <Loader2 size={11} className="animate-spin" /> : 'Confirm'}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="px-2 py-1.5 rounded-xl text-[11px] font-black bg-slate-100 text-slate-600">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(order.id)}
                          className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                          title="Delete order"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedId(isOpen ? null : order.id)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition"
                      >
                        {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded detail ── */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 bg-slate-50 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Order items */}
                          <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                              <Package size={12}/> Items ({order.order_items?.length || 0})
                            </h3>
                            {order.order_items?.length ? (
                              <div className="space-y-2">
                                {order.order_items.map(item => (
                                  <div key={item.id} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-slate-100">
                                    {item.products?.image_url && (
                                      <img src={item.products.image_url} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-slate-900 text-sm truncate">{item.products?.title || 'Product'}</p>
                                      <p className="text-xs text-slate-400">
                                        {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-xs text-slate-400">×{item.quantity}</p>
                                      <p className="font-black text-slate-900 text-sm">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No item data</p>
                            )}
                          </div>

                          {/* Shipping + summary */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                <MapPin size={12}/> Shipping Address
                              </h3>
                              <div className="bg-white rounded-xl p-3 border border-slate-100 text-sm text-slate-700 space-y-1">
                                {order.address ? <p>{order.address}</p> : null}
                                {order.city ? <p>{order.city}{order.postal_code ? `, ${order.postal_code}` : ''}</p> : null}
                                {!order.address && !order.city && <p className="text-slate-400 italic">No address provided</p>}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                <CreditCard size={12}/> Payment
                              </h3>
                              <div className="bg-white rounded-xl p-3 border border-slate-100 text-sm space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Method</span>
                                  <span className="font-semibold">{order.payment_method || 'COD'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Status</span>
                                  <span className={`font-black text-[11px] uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.payment_status || 'pending'}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2 mt-1">
                                  <span className="text-slate-500">Total</span>
                                  <span className="font-black text-slate-900">${Number(order.total_amount || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

