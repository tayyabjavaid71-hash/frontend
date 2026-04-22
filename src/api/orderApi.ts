import { API } from '../services/api';

export type CreateOrderPayload = {
  userId?: string;
  total_amount: number;
  currency?: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
  payment_method: 'COD' | 'CARD';
  status?: string;
  items: Array<{
    product_id: string;
    title?: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
};

export const orderApi = {
  create(payload: CreateOrderPayload) {
    return API.post('/orders/create', payload);
  },

  getById(orderId: string) {
    return API.get(`/orders/${orderId}`);
  },

  getMine() {
    return API.get('/orders/user/me');
  },

  getByUserId(userId: string) {
    return API.get(`/orders/user/${userId}`);
  },

  update(orderId: string, payload: { address?: string; phone?: string; city?: string; postal_code?: string }) {
    return API.put(`/orders/${orderId}`, payload);
  },

  cancel(orderId: string) {
    return API.delete(`/orders/${orderId}`);
  },
};

