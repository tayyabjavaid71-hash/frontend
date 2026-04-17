import { supabase } from './supabaseClient';
import type { Order, OrderStatus } from '../types';

export const orderService = {
  /**
   * Fetch orders for the current logged-in user
   */
  async fetchUserOrders(): Promise<Order[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No active session found');
        return [];
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(id, title, image_url, price))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('Error in fetchUserOrders:', err);
      throw err;
    }
  },

  /**
   * Fetch all orders (admin only)
   */
  async fetchAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(id, title, image_url, price))')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('Error in fetchAllOrders:', err);
      throw err;
    }
  },

  /**
   * Place a new order
   * 1. Create order record
   * 2. Insert order items
   * 3. Update stock for each product
   */
  async placeOrder(
    orderData: Record<string, unknown>,
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      selectedSize?: string;
      selectedColor?: string;
      variationId?: string;
    }>
  ): Promise<Order> {
    try {
      // 1. Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      if (!order) {
        throw new Error('Order creation returned no data');
      }

      // 2. Insert order items
      const itemsToInsert = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        variation_id: item.variationId || null,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize || null,
        color: item.selectedColor || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Order items insertion error:', itemsError);
        // Delete the order if items insertion fails
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to add order items: ${itemsError.message}`);
      }

      // 3. Reduce stock for each product
      for (const item of items) {
        try {
          if (item.variationId) {
            // Reduce variation-level stock
            await this.reduceVariationStock(item.variationId, item.quantity);
          } else {
            // Reduce product-level stock
            await this.reduceProductStock(item.id, item.quantity);
          }
        } catch (err) {
          console.warn(`Warning: Could not update stock for product ${item.id}:`, err);
          // Continue with order even if stock update fails
        }
      }

      return order;
    } catch (err) {
      console.error('Error in placeOrder:', err);
      throw err;
    }
  },

  /**
   * Reduce product-level stock
   */
  async reduceProductStock(productId: string, quantity: number): Promise<void> {
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch product: ${fetchError.message}`);
      }

      if (!product) {
        throw new Error('Product not found');
      }

      const newStock = Math.max(0, product.stock - quantity);

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) {
        throw new Error(`Failed to update stock: ${updateError.message}`);
      }
    } catch (err) {
      console.error(`Error reducing stock for product ${productId}:`, err);
      throw err;
    }
  },

  /**
   * Reduce variation-level stock
   */
  async reduceVariationStock(variationId: string, quantity: number): Promise<void> {
    try {
      const { data: variation, error: fetchError } = await supabase
        .from('product_variations')
        .select('stock')
        .eq('id', variationId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch variation: ${fetchError.message}`);
      }

      if (!variation) {
        throw new Error('Variation not found');
      }

      const newStock = Math.max(0, variation.stock - quantity);

      const { error: updateError } = await supabase
        .from('product_variations')
        .update({ stock: newStock })
        .eq('id', variationId);

      if (updateError) {
        throw new Error(`Failed to update variation stock: ${updateError.message}`);
      }
    } catch (err) {
      console.error(`Error reducing variation stock for variation ${variationId}:`, err);
      throw err;
    }
  },

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Order status update error:', error);
        throw new Error(`Failed to update order status: ${error.message}`);
      }

      if (!data) {
        throw new Error('Order status update returned no data');
      }

      return data;
    } catch (err) {
      console.error('Error in updateOrderStatus:', err);
      throw err;
    }
  },

  /**
   * Fetch a single order by ID — uses backend API (bypasses RLS, works for guests)
   */
  async fetchOrderById(orderId: string): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error(`Failed to fetch order: ${res.statusText}`);
      const json = await res.json();
      const order = json.order ?? json;
      if (!order?.id) throw new Error('Order not found');
      return order as Order;
    } catch (err) {
      console.error('Error in fetchOrderById:', err);
      throw err;
    }
  },

  /**
   * Cancel an order (if status allows)
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const order = await this.fetchOrderById(orderId);

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      return await this.updateOrderStatus(orderId, 'cancelled');
    } catch (err) {
      console.error('Error cancelling order:', err);
      throw err;
    }
  },
};
