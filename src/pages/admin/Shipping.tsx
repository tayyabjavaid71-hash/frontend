import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Plus, RefreshCw, Search, Loader2, AlertCircle,
  Edit2, Trash2, Save, X, Package,
} from 'lucide-react';
import { shippingApi, type ShippingRecord, type UpdateShippingPayload, type CreateShippingPayload } from '../../api/shippingApi';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  processing:       { label: 'Processing',      color: 'bg-amber-100 text-amber-800 border-amber-200' },
  shipped:          { label: 'Shipped',          color: 'bg-blue-100 text-blue-800 border-blue-200' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered:        { label: 'Delivered',        color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed:           { label: 'Failed',           color: 'bg-red-100 text-red-800 border-red-200' },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as Array<ShippingRecord['status']>;

type EditState = UpdateShippingPayload & { id: string };

const emptyCreate: CreateShippingPayload = {
  order_id: '',
  user_id: '',
  address: '',
  city: '',
  country: 'Pakistan',
  postal_code: '',
  shipping_method: 'standard',
  tracking_number: '',
  notes: '',
};

export const AdminShippingPage: React.FC = () => {
  const [records, setRecords]             = useState<ShippingRecord[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');

  const [editState, setEditState]   = useState<EditState | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showCreate, setShowCreate]   = useState(false);
  const [createForm, setCreateForm]   = useState<CreateShippingPayload>(emptyCreate);
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setSetupRequired(false);
    shippingApi.getAll()
      .then(res => {
        setRecords(res.data.data ?? []);
        if ((res.data as any).setupRequired) setSetupRequired(true);
      })
      .catch(() => setError('Failed to load shipping records.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      const { id, ...payload } = editState;
      const res = await shippingApi.update(id, payload);
      setRecords(r => r.map(x => x.id === id ? res.data.data : x));
      setEditState(null);
    } catch {
      alert('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this shipping record? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await shippingApi.remove(id);
      setRecords(r => r.filter(x => x.id !== id));
    } catch {
      alert('Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.address || !createForm.city) {
      setCreateError('Address and city are required.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const payload: CreateShippingPayload = {
        ...createForm,
        order_id:        createForm.order_id        || undefined,
        user_id:         createForm.user_id         || undefined,
        postal_code:     createForm.postal_code     || undefined,
        tracking_number: createForm.tracking_number || undefined,
        notes:           createForm.notes           || undefined,
      };
      const res = await shippingApi.create(payload);
      setRecords(r => [res.data.data, ...r]);
      setShowCreate(false);
      setCreateForm(emptyCreate);
    } catch (err: any) {
      setCreateError(err?.response?.data?.error ?? 'Failed to create.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = records.filter(r => {
    const matchSearch = !search ||
      r.address.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      (r.tracking_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.order_id ?? '').includes(search);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Truck size={22} className="text-amber-500" />
            Shipping Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage shipments and update tracking info</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors" aria-label="Refresh">
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="bg-slate-900 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            New Shipment
          </button>
        </div>
      </div>

      {/* Create Form Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm overflow-hidden"
          >
            <h2 className="font-black text-slate-800 mb-4 text-base">Create Shipping Record</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Order ID (UUID)" value={createForm.order_id} onChange={e => setCreateForm(f => ({ ...f, order_id: e.target.value }))} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="User ID (UUID)" value={createForm.user_id} onChange={e => setCreateForm(f => ({ ...f, user_id: e.target.value }))} />
              <input required className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Address *" value={createForm.address} onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))} />
              <input required className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="City *" value={createForm.city} onChange={e => setCreateForm(f => ({ ...f, city: e.target.value }))} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Country" value={createForm.country} onChange={e => setCreateForm(f => ({ ...f, country: e.target.value }))} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Postal Code" value={createForm.postal_code} onChange={e => setCreateForm(f => ({ ...f, postal_code: e.target.value }))} />
              <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                value={createForm.shipping_method} onChange={e => setCreateForm(f => ({ ...f, shipping_method: e.target.value }))}>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
              </select>
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Tracking Number" value={createForm.tracking_number} onChange={e => setCreateForm(f => ({ ...f, tracking_number: e.target.value }))} />
              <input className="sm:col-span-2 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Notes (optional)" value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))} />

              {createError && (
                <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500" />
                  <p className="text-red-700 text-sm">{createError}</p>
                </div>
              )}

              <div className="sm:col-span-2 flex gap-2">
                <button type="submit" disabled={creating}
                  className="bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition-colors">
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup Required Banner */}
      {setupRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-sm">Database setup required</p>
            <p className="text-amber-700 text-xs mt-0.5">
              The <code className="bg-amber-100 px-1 rounded font-mono">shipping</code> table does not exist yet.
              Run the SQL migration in Supabase to activate this feature.
            </p>
            <a href="https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql" target="_blank" rel="noreferrer"
              className="inline-block mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900">
              Open Supabase SQL Editor
            </a>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-50">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search address, city, tracking, order ID..."
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
          <Package size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="font-black text-slate-600 text-lg mb-2">No shipments found</h3>
          <p className="text-slate-400 text-sm">Create a new shipment or adjust your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Address</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Method</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Tracking</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3 font-black text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(record => {
                  const isEditing = editState?.id === record.id;
                  const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.processing;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {record.order_id ? record.order_id.slice(0, 8).toUpperCase() : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-45">
                        <p className="font-medium text-slate-800 truncate">{record.address}</p>
                        <p className="text-slate-400 text-xs">{record.city}, {record.country}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">{record.shipping_method}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-amber-400"
                            value={editState.tracking_number ?? ''}
                            onChange={e => setEditState(s => s ? { ...s, tracking_number: e.target.value } : s)}
                            placeholder="Tracking #"
                          />
                        ) : (
                          <span className="font-mono text-xs text-slate-600">{record.tracking_number ?? '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                            value={editState.status ?? record.status}
                            onChange={e => setEditState(s => s ? { ...s, status: e.target.value as ShippingRecord['status'] } : s)}
                          >
                            {ALL_STATUSES.map(st => <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>)}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${cfg.color}`}>
                            {cfg.label}
                          </span>
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
                                  tracking_number: record.tracking_number ?? '',
                                  shipping_method: record.shipping_method,
                                  notes: record.notes ?? '',
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
            Showing {filtered.length} of {records.length} records
          </div>
        </div>
      )}
    </div>
  );
};
