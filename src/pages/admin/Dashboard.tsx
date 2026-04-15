import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Users, DollarSign, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { API } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userHeader = user
          ? { id: user.id, role: profile?.role || 'admin', email: user.email }
          : { id: '1', role: 'admin' };

        const { data } = await API.get('/admin/analytics', {
          headers: { user: JSON.stringify(userHeader) },
        });

        setStats(data.analytics);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        // Fallback: zero-state so UI doesn't crash
        setStats({ totalRevenue: '0.00', totalOrders: 0, totalProducts: 0, totalUsers: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem]" />)}
      </div>
    );
  }

  const cards = [
    { title: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
    { title: 'Active Orders', value: stats.totalOrders, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+4' },
    { title: 'Collections', value: stats.totalProducts, icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Updated' },
    { title: 'Customers', value: stats.totalUsers, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+8%' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Performance Hub</span>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Boutique Executive</h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <Clock size={14} /> Real-time Updates
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.title}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`${card.bg} ${card.color} p-4 rounded-2xl`}>
                <card.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp size={10} /> {card.trend}
              </div>
            </div>
            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">{card.title}</h3>
            <p className="text-4xl font-black text-slate-800 tracking-tight">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tighter mb-2">Growth Projection</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Boutique performance is up 18% compared to last lunar cycle.</p>
                <div className="h-48 flex items-end gap-3">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 75, 100].map((h, i) => (
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.5 + (i * 0.05) }}
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-lg group-hover:to-white transition-colors" 
                        />
                    ))}
                </div>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-10">
                <TrendingUp size={160} />
            </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Activity</h3>
                <ArrowUpRight className="text-slate-300" size={20} />
            </div>
            <div className="space-y-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                            {i}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">New Order #JTC-{100 + i}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">2 mins ago</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
