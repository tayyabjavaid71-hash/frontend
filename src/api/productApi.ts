import { API } from '../services/api';

export const productApi = {
  getProducts(params?: { category_id?: string; limit?: number; offset?: number }) {
    return API.get('/products', { params });
  },

  getProductById(id: string) {
    return API.get(`/products/${id}`);
  },

  getCategories() {
    return API.get('/categories');
  },
};
