import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Users, DollarSign, TrendingUp, ArrowUpRight, Clock, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-24 bg-slate-100 rounded-4xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem]" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-4xl" />
      </div>
    );
  }

  const stats = data.analytics;
  const adminName = profile?.username || profile?.name || user?.email?.split('@')[0] || 'Admin';
  const adminEmail = profile?.email || user?.email || '';

  const cards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: `${stats.totalOrders} orders`,
    },
    {
      title: 'Active Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      trend: `${stats.pendingOrders} pending`,
    },
    {
      title: 'Collections',
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: `${stats.totalCategories} categories`,
    },
    {
      title: 'Customers',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      trend: 'Registered',
    },
  ];

  return (
    <div className="space-y-10 p-8">

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
          <AlertCircle size={16} />
          {error}
          <button onClick={refetch} className="ml-auto flex items-center gap-1 text-xs underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Admin identity banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-slate-900 to-slate-800 rounded-4xl px-8 py-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0">
            <User size={28} className="text-pink-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Logged in as</p>
            <p className="text-2xl font-black tracking-tight">{adminName}</p>
            <p className="text-slate-400 text-sm mt-0.5">{adminEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 font-black text-[10px] uppercase tracking-widest">
              {profile?.role || 'admin'}
            </span>
            {profile?.username && (
              <span className="text-slate-400 text-xs font-mono">@{profile.username}</span>
            )}
          </div>
          <button
            onClick={refetch}
            title="Refresh dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Admin Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-4xl border border-slate-100 shadow-sm p-6"
      >
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <User size={14} className="text-pink-500" /> Admin Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Username', value: profile?.username || '—' },
            { label: 'Email',    value: profile?.email || user?.email || '—' },
            { label: 'Role',     value: profile?.role || '—' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-2xl px-5 py-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className={`font-bold text-sm truncate ${item.label === 'Role' ? 'text-pink-600' : 'text-slate-800'}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section heading */}
      <div>
        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Live Data · Auto-updates</span>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Boutique Executive</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.title}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`${card.bg} ${card.color} p-4 rounded-2xl`}>
                <card.icon size={24} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp size={10} /> {card.trend}
              </span>
            </div>
            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">{card.title}</h3>
            <p className="text-4xl font-black text-slate-800 tracking-tight">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Growth chart + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tighter mb-2">Growth Projection</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Boutique performance overview.</p>
            <div className="h-48 flex items-end gap-3">
              {[40, 70, 45, 90, 65, 80, 55, 95, 75, 100].map((h, i) => (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  key={i}
                  className="flex-1 bg-linear-to-t from-primary/20 to-primary rounded-t-lg group-hover:to-white transition-colors"
                />
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <TrendingUp size={160} />
          </div>
        </div>

        {/* Recent Activity — real orders from DB */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Activity</h3>
            <ArrowUpRight className="text-slate-300" size={20} />
          </div>
          <div className="space-y-6">
            {data.recentOrders.length === 0 ? (
              <p className="text-slate-400 text-sm font-semibold text-center py-4">No recent orders</p>
            ) : (
              data.recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-4 items-center"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary font-black text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{order.customer_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        ${Number(order.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                    <Clock size={10} />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Users roster */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users size={20} /> Registered Users
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">{data.users.length} total members</p>
          </div>
        </div>
        {data.users.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Username</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-8 py-4 font-bold text-slate-900">{u.name || '—'}</td>
                    <td className="px-8 py-4 font-mono text-sm text-slate-600">{u.username || '—'}</td>
                    <td className="px-8 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-slate-400 text-xs font-semibold">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
