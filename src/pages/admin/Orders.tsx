import React, { useEffect, useState, useContext } from 'react';
import { API } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { AlertCircle, Loader2, ShoppingBag, ChevronDown, ChevronUp, Package, Phone, Mail, MapPin, CreditCard, Calendar } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const { user } = useContext(AuthContext)!;

  const authHeaders = { user: JSON.stringify(user || { id: '1', role: 'admin', name: 'Admin' }) };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/admin/orders', { headers: authHeaders });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/admin/orders/${orderId}`, { status: newStatus }, { headers: authHeaders });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed','processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-1">Orders</h1>
          <p className="text-slate-500">Manage and track all customer orders</p>
        </div>
        <button onClick={fetchOrders} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition">
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-900' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Processing', value: stats.processing, color: 'bg-blue-100 text-blue-800' },
          { label: 'Shipped', value: stats.shipped, color: 'bg-purple-100 text-purple-800' },
          { label: 'Delivered', value: stats.delivered, color: 'bg-green-100 text-green-800' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, color: 'bg-pink-100 text-pink-800' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wide mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition ${
              filter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {s === 'all' ? `All (${orders.length})` : s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const isOpen = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition">
                {/* Order Summary Row */}
                <div className="p-5 flex flex-wrap items-center gap-4">
                  {/* ID + Date */}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-slate-400 mb-1">#{order.id?.slice(0, 8).toUpperCase()}</p>
                    <p className="font-bold text-slate-900 text-lg">{order.customer_name || 'Guest'}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                      {order.email && <span className="flex items-center gap-1"><Mail size={11}/>{order.email}</span>}
                      {order.phone && <span className="flex items-center gap-1"><Phone size={11}/>{order.phone}</span>}
                      {order.created_at && <span className="flex items-center gap-1"><Calendar size={11}/>{new Date(order.created_at).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Payment</p>
                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                      <CreditCard size={13}/>{order.payment_method || 'COD'}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Total</p>
                    <p className="text-xl font-black text-slate-900">${Number(order.total_amount).toFixed(2)}</p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <div className="relative">
                      <select
                        value={order.status || 'pending'}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                          STATUS_COLORS[order.status] || STATUS_COLORS.pending
                        }`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {updatingId === order.id
                        ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin" />
                        : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      }
                    </div>
                  </div>

                  {/* Expand Toggle */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="p-2 rounded-lg hover:bg-slate-50 transition text-slate-400"
                  >
                    {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </button>
                </div>

                {/* Expanded Detail */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Products */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                        <Package size={14}/> Order Items ({order.order_items?.length || 0})
                      </h3>
                      {order.order_items?.length > 0 ? (
                        <div className="space-y-2">
                          {order.order_items.map((item: any) => (
                            <div key={item.id} className="bg-white rounded-lg p-3 flex items-center gap-3 border border-slate-100">
                              {item.products?.image_url && (
                                <img src={item.products.image_url} alt={item.products?.title} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 text-sm truncate">{item.products?.title || 'Product'}</p>
                                <p className="text-xs text-slate-500">
                                  {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-slate-500">x{item.quantity}</p>
                                <p className="font-bold text-slate-900 text-sm">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No items data</p>
                      )}
                    </div>

                    {/* Shipping + Customer */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                          <MapPin size={14}/> Shipping Address
                        </h3>
                        <div className="bg-white rounded-lg p-3 border border-slate-100 text-sm text-slate-700 space-y-1">
                          {order.address && <p>{order.address}</p>}
                          {order.city && <p>{order.city}{order.postal_code ? `, ${order.postal_code}` : ''}</p>}
                          {!order.address && !order.city && <p className="text-slate-400 italic">No address provided</p>}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Order Summary</h3>
                        <div className="bg-white rounded-lg p-3 border border-slate-100 text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-semibold">${Number(order.total_amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Payment</span>
                            <span className="font-semibold">{order.payment_method || 'COD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Payment Status</span>
                            <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {order.payment_status || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

