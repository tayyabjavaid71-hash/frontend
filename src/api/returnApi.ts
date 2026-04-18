import { API } from '../services/api';

export type ReturnRecord = {
  id: string;
  order_id: string | null;
  user_id: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refund_status: 'not_processed' | 'processing' | 'refunded' | 'failed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateReturnPayload = {
  order_id?: string;
  user_id?: string;
  reason: string;
};

export type UpdateReturnPayload = {
  status?: ReturnRecord['status'];
  refund_status?: ReturnRecord['refund_status'];
  admin_notes?: string;
};

export const returnApi = {
  getAll() {
    return API.get<{ data: ReturnRecord[] }>('/returns');
  },

  getByUser(userId: string) {
    return API.get<{ data: ReturnRecord[] }>(`/returns/user/${userId}`);
  },

  getByOrder(orderId: string) {
    return API.get<{ data: ReturnRecord[] }>(`/returns/order/${orderId}`);
  },

  create(payload: CreateReturnPayload) {
    return API.post<{ data: ReturnRecord }>('/returns', payload);
  },

  update(id: string, payload: UpdateReturnPayload) {
    return API.put<{ data: ReturnRecord }>(`/returns/${id}`, payload);
  },

  remove(id: string) {
    return API.delete<{ success: boolean }>(`/returns/${id}`);
  },
};
