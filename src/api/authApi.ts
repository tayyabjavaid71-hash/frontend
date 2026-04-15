import { API } from '../services/api';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  email: string;
  password: string;
  full_name?: string;
  role?: 'customer' | 'admin';
};

export const authApi = {
  login(payload: LoginPayload) {
    return API.post('/auth/login', payload);
  },

  signup(payload: SignupPayload) {
    return API.post('/auth/signup', payload);
  },

  me(userHeader?: unknown) {
    return API.get('/auth/me', {
      headers: userHeader ? { user: JSON.stringify(userHeader) } : {},
    });
  },
};
