import React, { useState } from 'react';
import { Truck, CheckCircle, Clock, Smartphone, MapPin, Package, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { Order } from '../../types';

interface OrdersTableProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  loading?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onUpdateStatus, loading = false }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={14} />;
      case 'shipped':
        return <Truck size={14} />;
      case 'confirmed':
        return <Package size={14} />;
      case 'cancelled':
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await onUpdateStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-12 text-center">
        <Package size={48} className="mx-auto mb-4 text-slate-300" />
        <h3 className="text-slate-600 font-black text-lg mb-2">No Orders Yet</h3>
        <p className="text-slate-400 text-sm">Orders will appear here when customers place them.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 w-16">
                Expand
              </th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                Order & Customer
              </th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                Location
              </th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                Total
              </th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                Date
              </th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
                Status
              </th>
              <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr
                  className={`border-b border-slate-50 hover:bg-slate-50/30 transition-colors ${
                    expandedRow === order.id ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <td className="p-6">
                    <button
                      onClick={() =>
                        setExpandedRow(expandedRow === order.id ? null : order.id)
                      }
                      className="p-3 bg-slate-50 rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      aria-label={
                        expandedRow === order.id ? 'Hide details' : 'Show details'
                      }
                      disabled={loading || updatingOrderId === order.id}
                    >
                      {expandedRow === order.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight text-sm">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-700 text-sm mt-1">
                        {order.customer_name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Smartphone size={12} /> {order.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-600 text-xs">
                        {order.city}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <MapPin size={10} />
                        <span className="truncate">{order.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-primary text-lg">
                      ${(order.total_amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="font-bold text-slate-500 text-xs">
                      {formatDate(order.created_at)}
                    </span>
                  </td>
                  <td className="p-6">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      disabled={loading || updatingOrderId === order.id}
                      className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>

                {expandedRow === order.id && (
                  <tr className="bg-slate-50/30">
                    <td colSpan={7} className="p-8">
                      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <div className="mb-8">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                            Shipping Information
                          </h4>
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                              <p className="font-black text-slate-600">Full Address</p>
                              <p className="text-slate-700 mt-1">
                                {order.address}, {order.city}
                              </p>
                            </div>
                            <div>
                              <p className="font-black text-slate-600">Phone</p>
                              <p className="text-slate-700 mt-1">{order.phone}</p>
                            </div>
                            <div>
                              <p className="font-black text-slate-600">Payment Method</p>
                              <p className="text-slate-700 mt-1">
                                {order.payment_method || 'COD'}
                              </p>
                            </div>
                            <div>
                              <p className="font-black text-slate-600">Order Date</p>
                              <p className="text-slate-700 mt-1">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-t border-slate-100 pt-8">
                            Order Items
                          </h4>
                          <div className="space-y-4">
                            {order.order_items && order.order_items.length > 0 ? (
                              order.order_items.map(item => (
                                <div
                                  key={item.id}
                                  className="flex items-start gap-6 pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                                >
                                  <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                    <img
                                      src={item.products?.image_url || ''}
                                      alt={item.products?.title || 'Product'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-black text-slate-800 text-sm line-clamp-1">
                                      {item.products?.title || 'Product'}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                      {item.size && <span>Size: {item.size}</span>}
                                      {item.color && <span>Color: {item.color}</span>}
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-black text-slate-800 text-sm">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                                      per: ${item.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-400 text-sm">No items in this order</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-slate-700 text-lg">
                              Order Total
                            </span>
                            <span className="font-black text-primary text-3xl">
                              ${(order.total_amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
