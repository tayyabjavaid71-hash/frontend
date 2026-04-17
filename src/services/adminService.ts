import { API, getApiToken } from './api';

/** Return the Authorization header for admin API calls.
 * Reads from the module-level token store that AuthContext keeps up-to-date.
 * This avoids the race condition where getSession() returns a stale/wrong session.
 */
const getAdminHeader = (): Record<string, string> => {
  const token = getApiToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  // No real session (demo / offline) — use legacy compact header
  return { user: JSON.stringify({ id: 'demo-admin', role: 'admin', email: 'admin@jtcollections.com' }) };
};


export const adminService = {
  // ── Products ─────────────────────────────────────────────────────────────
  async fetchProducts(search?: string) {
    const headers = getAdminHeader();
    const params = search ? { search } : {};
    const { data } = await API.get('/admin/products', { headers, params });
    return (data.products || []) as any[];
  },
  async createProduct(product: any) {
    const headers = getAdminHeader();
    const { data } = await API.post('/admin/products', product, { headers });
    if (!data.success) throw new Error(data.error || 'Failed to create product');
    return data.product;
  },
  async updateProduct(id: string, updates: any) {
    const headers = getAdminHeader();
    const { data } = await API.put(`/admin/products/${id}`, updates, { headers });
    if (!data.success) throw new Error(data.error || 'Failed to update product');
    return data.product;
  },
  async deleteProduct(id: string) {
    const headers = getAdminHeader();
    const { data } = await API.delete(`/admin/products/${id}`, { headers });
    if (data && !data.success) throw new Error(data.error || 'Failed to delete product');
  },

  // ── Categories ────────────────────────────────────────────────────────────
  async fetchCategories() {
    const headers = getAdminHeader();
    const { data } = await API.get('/admin/categories', { headers });
    return (data.categories || []) as any[];
  },
  async fetchSubcategories(categoryId?: string) {
    const headers = getAdminHeader();
    const params = categoryId ? { category_id: categoryId } : {};
    const { data } = await API.get('/admin/subcategories', { headers, params });
    return (data.subcategories || []) as any[];
  },
  async createCategory(category: any) {
    const headers = getAdminHeader();
    const { data } = await API.post('/admin/categories', category, { headers });
    if (!data.success) throw new Error(data.error || 'Failed to create category');
    return data.category;
  },
  async updateCategory(id: string, updates: any) {
    const headers = getAdminHeader();
    const { data } = await API.put(`/admin/categories/${id}`, updates, { headers });
    if (!data.success) throw new Error(data.error || 'Failed to update category');
    return data.category;
  },
  async deleteCategory(id: string) {
    const headers = getAdminHeader();
    const { data } = await API.delete(`/admin/categories/${id}`, { headers });
    if (data && !data.success) throw new Error(data.error || 'Failed to delete category');
  },
  async createSubcategory(subcategory: any) {
    const headers = getAdminHeader();
    const { data } = await API.post('/admin/subcategories', subcategory, { headers });
    if (!data.success) throw new Error(data.error || 'Failed to create subcategory');
    return data.subcategory;
  },
  async updateSubcategory(id: string, updates: any) {
    const headers = getAdminHeader();
    const { data } = await API.put(`/admin/subcategories/${id}`, updates, { headers });
    if (!data.success) throw new Error(data.error || 'Failed to update subcategory');
    return data.subcategory;
  },
  async deleteSubcategory(id: string) {
    const headers = getAdminHeader();
    await API.delete(`/admin/subcategories/${id}`, { headers });
  },

  // ── Analytics & Users ─────────────────────────────────────────────────────
  async getAnalytics() {
    const headers = getAdminHeader();
    const { data } = await API.get('/admin/analytics', { headers });
    return data.analytics || { totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: '0.00' };
  },
  async fetchUsers() {
    const headers = getAdminHeader();
    const { data } = await API.get('/admin/users', { headers });
    return (data.users || []) as any[];
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  async fetchOrders() {
    const headers = getAdminHeader();
    const { data } = await API.get('/admin/orders', { headers });
    return { data: Array.isArray(data) ? data : [] };
  },
  async updateOrderStatus(orderId: string, status: string) {
    const headers = getAdminHeader();
    const { data } = await API.put(`/admin/orders/${orderId}`, { status }, { headers });
    return data;
  },

  // ── Admin verification (uses backend, not direct Supabase) ───────────────
  async isAdmin() {
    try {
      const headers = getAdminHeader();
      const { data } = await API.get('/admin/dashboard', { headers });
      return !!data?.success;
    } catch {
      return false;
    }
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  async fetchDashboard() {
    const headers = getAdminHeader();
    const { data } = await API.get('/admin/dashboard', { headers });
    return data as {
      success: boolean;
      analytics: {
        totalProducts: number;
        totalOrders: number;
        totalUsers: number;
        totalCategories: number;
        totalRevenue: string;
        pendingOrders: number;
      };
      users: Array<{ id: string; name?: string; username?: string; email?: string; role?: string; created_at?: string }>;
    };
  },
};
