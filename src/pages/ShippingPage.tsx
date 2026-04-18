import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Truck, CheckCircle, Clock, AlertCircle,
  MapPin, Search, Loader2, RefreshCw,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AuthContext } from '../context/AuthContext';
import { shippingApi, type ShippingRecord } from '../api/shippingApi';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  processing:        { label: 'Processing',        color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: <Clock size={13} /> },
  shipped:           { label: 'Shipped',           color: 'bg-blue-50 text-blue-700 border-blue-200',        icon: <Truck size={13} /> },
  out_for_delivery:  { label: 'Out for Delivery',  color: 'bg-purple-50 text-purple-700 border-purple-200',  icon: <Truck size={13} /> },
  delivered:         { label: 'Delivered',         color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={13} /> },
  failed:            { label: 'Failed',            color: 'bg-red-50 text-red-700 border-red-200',           icon: <AlertCircle size={13} /> },
};

const METHOD_LABEL: Record<string, string> = {
  standard: 'Standard Delivery (5-7 days)',
  express:  'Express Delivery (1-2 days)',
};

export const ShippingPage: React.FC = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext)!;
  const [records, setRecords]   = useState<ShippingRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    shippingApi.getByUser(user.id)
      .then(res => setRecords(res.data.data ?? []))
      .catch(() => setError('Could not load shipping data. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const filtered = records.filter(r =>
    r.address.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase()) ||
    (r.tracking_number ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Shipments</h1>
            <p className="text-slate-500 mt-1 text-sm">Track all your orders in transit</p>
          </div>

          {/* Search + Refresh */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by address, city or tracking number…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              onClick={load}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={16} className="text-slate-500" />
            </button>
          </div>

          {/* States */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 size={36} className="animate-spin text-slate-400" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="font-black text-slate-600 text-lg mb-2">
                {search ? 'No results found' : 'No shipments yet'}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {search ? 'Try a different search term.' : 'Place an order to see your shipping info here.'}
              </p>
              {!search && (
                <Link to="/shop" className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">
                  Shop Now
                </Link>
              )}
            </div>
          )}

          {/* Shipment Cards */}
          <div className="space-y-4">
            {filtered.map((record, i) => {
              const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.processing;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <p className="font-black text-slate-900 text-sm">
                        Order #{record.order_id ? record.order_id.slice(0, 8).toUpperCase() : 'N/A'}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {new Date(record.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.color}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Address</p>
                        <p className="text-slate-800 font-medium">{record.address}, {record.city}</p>
                        <p className="text-slate-500 text-xs">{record.country}{record.postal_code ? ` — ${record.postal_code}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Method</p>
                        <p className="text-slate-800 font-medium">{METHOD_LABEL[record.shipping_method] ?? record.shipping_method}</p>
                      </div>
                    </div>
                    {record.tracking_number && (
                      <div className="sm:col-span-2 bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Tracking Number</p>
                        <p className="text-slate-900 font-black font-mono tracking-widest">{record.tracking_number}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Notes</p>
                        <p className="text-slate-600 text-sm">{record.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Return link — only for delivered */}
                  {record.status === 'delivered' && record.order_id && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Link
                        to={`/returns?order=${record.order_id}`}
                        className="text-xs font-bold text-amber-600 hover:text-amber-800 underline underline-offset-2"
                      >
                        Request a return for this order →
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
