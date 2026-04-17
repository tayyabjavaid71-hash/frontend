import { useCallback, useEffect, useRef, useState } from 'react';
import { API } from '../services/api';
import { supabase } from '../services/supabaseClient';

export type DashboardAnalytics = {
  totalRevenue: string;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  pendingOrders: number;
};

export type RecentOrder = {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export type DashboardUser = {
  id: string;
  name?: string;
  username?: string;
  role?: string;
  created_at?: string;
};

export type DashboardData = {
  analytics: DashboardAnalytics;
  recentOrders: RecentOrder[];
  users: DashboardUser[];
};

const EMPTY: DashboardData = {
  analytics: {
    totalRevenue: '0.00',
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalCategories: 0,
    pendingOrders: 0,
  },
  recentOrders: [],
  users: [],
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: res } = await API.get('/admin/dashboard');
      if (!mountedRef.current) return;
      setData({
        analytics: res.analytics ?? EMPTY.analytics,
        recentOrders: res.recentOrders ?? [],
        users: res.users ?? [],
      });
      setError(null);
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.error || 'Failed to load dashboard');
      setData(EMPTY);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchDashboard();
    return () => { mountedRef.current = false; };
  }, [fetchDashboard]);

  // Supabase realtime — re-fetch dashboard whenever orders, products, or categories change
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchDashboard())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}
