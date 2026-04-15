import { supabase } from './supabaseClient';

export const adminService = {
  // Products CRUD
  async createProduct(product: any) {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    return data;
  },
  async updateProduct(id: string, updates: any) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Categories CRUD
  async fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async fetchSubcategories(categoryId?: string) {
    let query = supabase
      .from('subcategories')
      .select('*, categories(name, slug)')
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async createCategory(category: any) {
    const { data, error } = await supabase.from('categories').insert([category]).select().single();
    if (error) throw error;
    return data;
  },
  async updateCategory(id: string, updates: any) {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
  async createSubcategory(subcategory: any) {
    const { data, error } = await supabase.from('subcategories').insert([subcategory]).select().single();
    if (error) throw error;
    return data;
  },
  async updateSubcategory(id: string, updates: any) {
    const { data, error } = await supabase.from('subcategories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteSubcategory(id: string) {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
  },

  // Analytics & User Management
  async getAnalytics() {
    const { data: products } = await supabase.from('products').select('id', { count: 'exact' });
    const { data: orders } = await supabase.from('orders').select('total_amount, status', { count: 'exact' });
    const { data: users } = await supabase.from('users').select('id', { count: 'exact' });

    const totalRevenue = orders?.reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0) || 0;
    
    return {
      totalProducts: products?.length || 0,
      totalOrders: orders?.length || 0,
      totalUsers: users?.length || 0,
      totalRevenue: totalRevenue.toFixed(2)
    };
  },

  async fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Orders Management
  async fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data: data || [] };
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Admin Verification
  async isAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    return data?.role === 'admin';
  }
};
