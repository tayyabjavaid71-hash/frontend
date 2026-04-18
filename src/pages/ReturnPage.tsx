import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, AlertCircle, CheckCircle, Clock,
  XCircle, Loader2, Package, BadgeCheck, RefreshCw,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AuthContext } from '../context/AuthContext';
import { returnApi, type ReturnRecord } from '../api/returnApi';
import { orderApi } from '../api/orderApi';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending Review',  color: 'bg-amber-50 text-amber-700 border-amber-200',    icon: <Clock size={13} /> },
  approved:  { label: 'Approved',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={13} /> },
  rejected:  { label: 'Rejected',        color: 'bg-red-50 text-red-700 border-red-200',           icon: <XCircle size={13} /> },
  completed: { label: 'Completed',       color: 'bg-blue-50 text-blue-700 border-blue-200',        icon: <BadgeCheck size={13} /> },
};

const REFUND_CONFIG: Record<string, { label: string; color: string }> = {
  not_processed: { label: 'Not Processed', color: 'text-slate-500' },
  processing:    { label: 'Processing',    color: 'text-amber-600' },
  refunded:      { label: 'Refunded',      color: 'text-emerald-600' },
  failed:        { label: 'Failed',        color: 'text-red-600' },
};

export const ReturnPage: React.FC = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext)!;
  const [searchParams] = useSearchParams();
  const prefilledOrderId = searchParams.get('order') ?? '';

  const [returns, setReturns]         = useState<ReturnRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);

  const [orders, setOrders]           = useState<Array<{ id: string; status: string; created_at: string }>>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [form, setForm] = useState({
    order_id: prefilledOrderId,
    reason: '',
  });

  const loadReturns = () => {
    if (!user) return;
    setLoading(true);
    returnApi.getByUser(user.id)
      .then(res => setReturns(res.data.data ?? []))
      .catch(() => setError('Failed to load your return requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    loadReturns();
    // Load eligible orders (delivered only)
    setOrdersLoading(true);
    orderApi.getMine()
      .then(res => {
        const all = res.data?.orders ?? [];
        setOrders(all.filter((o: any) => o.status === 'delivered'));
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.reason.trim()) {
      setSubmitError('Please describe the reason for your return.');
      return;
    }

    setSubmitting(true);
    try {
      await returnApi.create({
        order_id: form.order_id || undefined,
        user_id: user.id,
        reason: form.reason.trim(),
      });
      setSuccess(true);
      setForm({ order_id: '', reason: '' });
      loadReturns();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Failed to submit return request.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 space-y-10">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Returns & Refunds</h1>
            <p className="text-slate-500 mt-1 text-sm">Submit a return request for a delivered order</p>
          </div>

          {/* Return Request Form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
              <RotateCcw size={18} className="text-amber-500" />
              New Return Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Order selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Order (optional — only delivered orders)
                </label>
                {ordersLoading ? (
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ) : (
                  <select
                    value={form.order_id}
                    onChange={e => setForm(f => ({ ...f, order_id: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="">— Select order (or leave blank) —</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id.slice(0, 8).toUpperCase()} — {new Date(o.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                )}
                {orders.length === 0 && !ordersLoading && (
                  <p className="text-xs text-slate-400 mt-1">You have no delivered orders eligible for return.</p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={4}
                  placeholder="Please describe why you want to return this order (e.g. damaged item, wrong size, etc.)"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              {/* Errors / Success */}
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"
                  >
                    <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2"
                  >
                    <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-700 text-sm font-semibold">Return request submitted successfully! We'll review it within 1-2 business days.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-colors"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                {submitting ? 'Submitting…' : 'Submit Return Request'}
              </button>
            </form>
          </div>

          {/* My Return Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">My Return Requests</h2>
              <button
                onClick={loadReturns}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw size={15} className="text-slate-500" />
              </button>
            </div>

            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-slate-400" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && returns.length === 0 && (
              <div className="text-center py-12">
                <Package size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 text-sm">You haven't submitted any return requests yet.</p>
              </div>
            )}

            <div className="space-y-3">
              {returns.map((r, i) => {
                const cfg      = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                const refundCfg = REFUND_CONFIG[r.refund_status] ?? REFUND_CONFIG.not_processed;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                      <div>
                        <p className="font-black text-slate-900 text-sm">
                          {r.order_id ? `Order #${r.order_id.slice(0, 8).toUpperCase()}` : 'General Return'}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Submitted {new Date(r.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.color}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm mb-3 leading-relaxed">{r.reason}</p>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">Refund: <span className={`font-bold ${refundCfg.color}`}>{refundCfg.label}</span></span>
                    </div>

                    {r.admin_notes && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Admin Note</p>
                        <p className="text-slate-600 text-sm">{r.admin_notes}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
