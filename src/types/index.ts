// Product
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  old_price?: number;
  stock: number;
  image_url: string;
  category_id?: string;
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  season?: string;
  created_at: string;
}

// Order Item
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variation_id?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  created_at: string;
  // Joined data
  products?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
  };
}

// Order Status Type
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending_payment';

// Order
export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  total_amount: number;
  status: OrderStatus;
  payment_method?: string;
  created_at: string;
  // Joined data
  order_items?: OrderItem[];
}

// Cart Item
export interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
  stock?: number;
  selectedSize?: string;
  selectedColor?: string;
  variationId?: string;
  cart_id?: string; // Add cart_id for database operations
}

// Checkout Form Data
export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
}

// API Response Types
export interface OrderResponse {
  success: boolean;
  order?: Order;
  message?: string;
}

export interface OrdersResponse {
  data: Order[];
  error?: string;
}

// User
export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}
