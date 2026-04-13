import React, { useEffect } from 'react';
import { OrdersTable } from '../../components/admin/OrdersTable';
import { Loader2 } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';

export const AdminOrders: React.FC = () => {
  const { orders, loading, error, fetchAllOrders, updateOrderStatus } = useOrders();

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Order Management</h1>
        <p className="text-slate-500 font-medium">Review and process customer transactions</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      <OrdersTable orders={orders} onUpdateStatus={async (id, status) => { await updateOrderStatus(id, status as any); }} loading={loading} />
    </div>
  );
};
