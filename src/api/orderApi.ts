import { API } from '../services/api';

export type CreateOrderPayload = {
  userId?: string;
  total_amount: number;
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
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
};

export const orderApi = {
  create(payload: CreateOrderPayload, userHeader: unknown) {
    return API.post('/orders/create', payload, {
      headers: { user: JSON.stringify(userHeader) },
    });
  },

  getMine(userHeader: unknown) {
    return API.get('/orders/user/me', {
      headers: { user: JSON.stringify(userHeader) },
    });
  },

  getByUserId(userId: string, userHeader: unknown) {
    return API.get(`/orders/user/${userId}`, {
      headers: { user: JSON.stringify(userHeader) },
    });
  },
};
