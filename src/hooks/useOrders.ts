import { useState, useCallback } from 'react';
import type { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's orders
  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.fetchUserOrders();
      setOrders(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      console.error('Error fetching user orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all orders (admin only)
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.fetchAllOrders();
      setOrders(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      console.error('Error fetching all orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status (admin only)
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      setError(null);
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: updatedOrder.status } : order
        )
      );
      return updatedOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
      console.error('Error updating order status:', err);
      throw err;
    }
  }, []);

  // Place new order
  const placeOrder = useCallback(
    async (
      orderData: Record<string, unknown>,
      items: Array<{
        id: string;
        quantity: number;
        price: number;
        selectedSize?: string;
        selectedColor?: string;
        variationId?: string;
      }>
    ) => {
      try {
        setError(null);
        const newOrder = await orderService.placeOrder(orderData, items);
        return newOrder;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to place order';
        setError(message);
        console.error('Error placing order:', err);
        throw err;
      }
    },
    []
  );

  // Set orders directly (for manual updates)
  const setOrdersDirectly = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
  }, []);

  return {
    orders,
    loading,
    error,
    fetchUserOrders,
    fetchAllOrders,
    updateOrderStatus,
    placeOrder,
    setOrders: setOrdersDirectly,
  };
};
