import { API } from '../services/api';

export type ShippingRecord = {
  id: string;
  order_id: string | null;
  user_id: string | null;
  address: string;
  city: string;
  country: string;
  postal_code: string | null;
  shipping_method: string;
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'failed';
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateShippingPayload = {
  order_id?: string;
  user_id?: string;
  address: string;
  city: string;
  country?: string;
  postal_code?: string;
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
};

export type UpdateShippingPayload = {
  status?: ShippingRecord['status'];
  tracking_number?: string;
  shipping_method?: string;
  notes?: string;
};

export const shippingApi = {
  getAll() {
    return API.get<{ data: ShippingRecord[] }>('/shipping');
  },

  getByOrder(orderId: string) {
    return API.get<{ data: ShippingRecord | null }>(`/shipping/order/${orderId}`);
  },

  getByUser(userId: string) {
    return API.get<{ data: ShippingRecord[] }>(`/shipping/user/${userId}`);
  },

  create(payload: CreateShippingPayload) {
    return API.post<{ data: ShippingRecord }>('/shipping', payload);
  },

  update(id: string, payload: UpdateShippingPayload) {
    return API.put<{ data: ShippingRecord }>(`/shipping/${id}`, payload);
  },

  remove(id: string) {
    return API.delete<{ success: boolean }>(`/shipping/${id}`);
  },
};
