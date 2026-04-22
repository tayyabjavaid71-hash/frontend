import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Loader2, Mail, RefreshCw, RotateCcw, XCircle,
} from 'lucide-react';
import { API } from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface EmailLog {
  id:         string;
  order_id:   string | null;
  user_id:    string | null;
  email:      string;
  type:       string;
  subject:    string | null;
  status:     'sent' | 'failed' | 'pending';
  error_msg:  string | null;
  attempts:   number;
  sent_at:    string | null;
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  sent:    'bg-green-100 text-green-800 border-green-200',
  failed:  'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const TYPE_LABEL: Record<string, string> = {
  order_confirmation: 'Confirmation',
  status_update:      'Status Update',
};

// ── Component ─────────────────────────────────────────────────────────────────
export const AdminEmailLogs: React.FC = () => {
  const [logs,     setLogs]     = useState<EmailLog[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchLogs = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page:  String(p),
        limit: String(LIMIT),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(typeFilter   !== 'all' ? { type:   typeFilter   } : {}),
      });
      const { data } = await API.get(`/admin/email-logs?${params}`);
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load email logs');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleRetry = async (logId: string) => {
    setRetrying(logId);
    try {
      await API.post(`/admin/email-logs/${logId}/retry`);
      // Refresh after a short delay so the new log row is visible
      setTimeout(() => fetchLogs(), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Retry failed');
    } finally {
      setRetrying(null);
    }
  };

  // Stats derived from current page
  const stats = {
    total:  total,
    sent:   logs.filter(l => l.status === 'sent').length,
    failed: logs.filter(l => l.status === 'failed').length,
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading && logs.length === 0) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 w-64 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-indigo-500 font-black uppercase tracking-[0.3em] text-[10px] block mb-1">Email System</span>
          <h1 className="text-4xl font-black text-slate-900">Email Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Track every transactional email sent by JT Collections</p>
        </div>
        <button
          onClick={() => fetchLogs()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Emails', value: total,        color: 'bg-slate-100 text-slate-900' },
          { label: 'Sent',         value: stats.sent,   color: 'bg-green-100 text-green-800' },
          { label: 'Failed',       value: stats.failed, color: 'bg-red-100 text-red-800'    },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Filter:</span>
        {['all', 'sent', 'failed', 'pending'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide transition ${
              statusFilter === s
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="w-px h-4 bg-slate-200 mx-1" />
        {['all', 'order_confirmation', 'status_update'].map(t => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              typeFilter === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t === 'all' ? 'All Types' : TYPE_LABEL[t] ?? t}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      {logs.length === 0 && !loading ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
          <Mail className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">No email logs found</p>
          <p className="text-slate-400 text-sm mt-1">Logs will appear here after the first email is sent</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_130px_110px_80px_80px_100px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Recipient / Subject</span>
            <span>Type</span>
            <span>Order Ref</span>
            <span>Attempts</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <AnimatePresence>
            {logs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`grid grid-cols-[1fr_130px_110px_80px_80px_100px] gap-3 px-5 py-4 items-start border-b border-slate-100 last:border-0 ${idx % 2 === 0 ? '' : 'bg-slate-50/50'} hover:bg-blue-50/30 transition-colors`}
              >
                {/* Email + subject */}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    {log.email}
                  </p>
                  {log.subject && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{log.subject}</p>
                  )}
                  {log.error_msg && (
                    <p className="text-[11px] text-red-500 mt-0.5 truncate" title={log.error_msg}>
                      ⚠ {log.error_msg}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(log.created_at).toLocaleString('en-GB')}
                  </p>
                </div>

                {/* Type */}
                <span className="text-xs text-slate-600 font-medium pt-0.5">
                  {TYPE_LABEL[log.type] ?? log.type}
                </span>

                {/* Order ref */}
                <span className="font-mono text-xs text-slate-500 pt-0.5">
                  {log.order_id ? `#${log.order_id.slice(0, 8).toUpperCase()}` : '—'}
                </span>

                {/* Attempts */}
                <span className="text-xs text-slate-500 pt-0.5 text-center">{log.attempts}</span>

                {/* Status badge */}
                <div className="pt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${STATUS_STYLE[log.status] ?? STATUS_STYLE.pending}`}>
                    {log.status === 'sent'    && <CheckCircle2 size={9} />}
                    {log.status === 'failed'  && <XCircle      size={9} />}
                    {log.status === 'pending' && <Loader2      size={9} className="animate-spin" />}
                    {log.status}
                  </span>
                </div>

                {/* Retry button */}
                <div className="text-right pt-0.5">
                  {log.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(log.id)}
                      disabled={retrying === log.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition disabled:opacity-50"
                    >
                      {retrying === log.id
                        ? <Loader2 size={11} className="animate-spin" />
                        : <RotateCcw size={11} />}
                      Retry
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-700">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
