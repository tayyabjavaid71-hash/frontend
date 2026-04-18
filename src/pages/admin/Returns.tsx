import React, { useEffect, useState, useCallback } from 'react';
import {
  RotateCcw, RefreshCw, Search, Loader2, AlertCircle,
  Edit2, Trash2, Save, X,
} from 'lucide-react';
import { returnApi, type ReturnRecord, type UpdateReturnPayload } from '../../api/returnApi';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved:  { label: 'Approved',  color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-800 border-red-200' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

const REFUND_CONFIG: Record<string, { label: string; color: string }> = {
  not_processed: { label: 'Not Processed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  processing:    { label: 'Processing',    color: 'bg-amber-100 text-amber-800 border-amber-200' },
  refunded:      { label: 'Refunded',      color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed:        { label: 'Failed',        color: 'bg-red-100 text-red-800 border-red-200' },
};

const ALL_STATUSES: Array<ReturnRecord['status']> = ['pending', 'approved', 'rejected', 'completed'];
const ALL_REFUND_STATUSES: Array<ReturnRecord['refund_status']> = ['not_processed', 'processing', 'refunded', 'failed'];

type EditState = UpdateReturnPayload & { id: string };

export const AdminReturnsPage: React.FC = () => {
  const [records, setRecords]       = useState<ReturnRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [editState, setEditState]   = useState<EditState | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setSetupRequired(false);
    returnApi.getAll()
      .then(res => {
        setRecords(res.data.data ?? []);
        if ((res.data as any).setupRequired) setSetupRequired(true);
      })
      .catch(() => setError('Failed to load return requests.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      const { id, ...payload } = editState;
      const res = await returnApi.update(id, payload);
      setRecords(r => r.map(x => x.id === id ? res.data.data : x));
      setEditState(null);
    } catch {
      alert('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this return request? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await returnApi.remove(id);
      setRecords(r => r.filter(x => x.id !== id));
    } catch {
      alert('Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = records.filter(r => {
    const matchSearch = !search ||
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      (r.order_id ?? '').includes(search) ||
      (r.user_id ?? '').includes(search);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = records.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <RotateCcw size={22} className="text-amber-500" />
            Returns Management
            {pendingCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs font-black rounded-full px-2 py-0.5">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review and process customer return requests</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors" aria-label="Refresh">
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Setup Required Banner */}
      {setupRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-sm">Database setup required</p>
            <p className="text-amber-700 text-xs mt-0.5">The <code className="bg-amber-100 px-1 rounded font-mono">returns</code> table doesn't exist yet. Run the SQL migration in Supabase to activate this feature.</p>
            <a href="https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql" target="_blank" rel="noreferrer"
              className="inline-block mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900">
              Open Supabase SQL Editor →
            </a>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reason, order ID, user ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_STATUSES.map(s => {
          const count = records.filter(r => r.status === s).length;
          if (!count) return null;
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${filterStatus === s ? STATUS_CONFIG[s].color + ' ring-2 ring-offset-1 ring-amber-400' : STATUS_CONFIG[s].color + ' opacity-70 hover:opacity-100'}`}>
              {STATUS_CONFIG[s].label} <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <RotateCcw size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="font-black text-slate-600 text-lg mb-2">No return requests found</h3>
          <p className="text-slate-400 text-sm">Return requests will appear here when customers submit them.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Reason</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Refund</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Admin Notes</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(record => {
                  const isEditing = editState?.id === record.id;
                  const sCfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.pending;
                  const rCfg = REFUND_CONFIG[record.refund_status] ?? REFUND_CONFIG.not_processed;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {record.order_id ? record.order_id.slice(0, 8).toUpperCase() : '—'}
                        </span>
                        {record.user_id && (
                          <p className="text-slate-400 text-[10px] font-mono mt-0.5">{record.user_id.slice(0, 8)}…</p>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-slate-700 text-xs leading-relaxed line-clamp-2">{record.reason}</p>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                            value={editState.status ?? record.status}
                            onChange={e => setEditState(s => s ? { ...s, status: e.target.value as ReturnRecord['status'] } : s)}
                          >
                            {ALL_STATUSES.map(st => <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>)}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${sCfg.color}`}>
                            {sCfg.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                            value={editState.refund_status ?? record.refund_status}
                            onChange={e => setEditState(s => s ? { ...s, refund_status: e.target.value as ReturnRecord['refund_status'] } : s)}
                          >
                            {ALL_REFUND_STATUSES.map(rs => <option key={rs} value={rs}>{REFUND_CONFIG[rs].label}</option>)}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${rCfg.color}`}>
                            {rCfg.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        {isEditing ? (
                          <input
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-amber-400"
                            value={editState.admin_notes ?? ''}
                            onChange={e => setEditState(s => s ? { ...s, admin_notes: e.target.value } : s)}
                            placeholder="Admin notes…"
                          />
                        ) : (
                          <p className="text-slate-500 text-xs line-clamp-2">{record.admin_notes ?? '—'}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(record.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={handleSave} disabled={saving}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors disabled:opacity-50" title="Save">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              </button>
                              <button onClick={() => setEditState(null)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors" title="Cancel">
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditState({
                                  id: record.id,
                                  status: record.status,
                                  refund_status: record.refund_status,
                                  admin_notes: record.admin_notes ?? '',
                                })}
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                disabled={deletingId === record.id}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50" title="Delete">
                                {deletingId === record.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Showing {filtered.length} of {records.length} requests
          </div>
        </div>
      )}
    </div>
  );
};
