import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AdminOrders } from '../pages/admin/Orders';
import { Dashboard } from '../pages/admin/Dashboard';
import { AdminProducts } from '../pages/admin/Products';
import { AdminUsers } from '../pages/admin/Users';
import { AdminCategories } from '../pages/admin/Categories';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Register } from '../pages/Register';
import { Wishlist } from '../pages/Wishlist';
import { SuccessPage } from '../pages/SuccessPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ShippingPage } from '../pages/ShippingPage';
import { ReturnPage } from '../pages/ReturnPage';
import { AdminShippingPage } from '../pages/admin/Shipping';
import { AdminReturnsPage } from '../pages/admin/Returns';
import { AdminEmailLogs } from '../pages/admin/EmailLogs';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/my-orders" element={<MyOrdersPage />} />
      <Route path="/shipping" element={<ShippingPage />} />
      <Route path="/returns" element={<ReturnPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Admin Routes — wrapped with ProtectedRoute (role=admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="shipping" element={<AdminShippingPage />} />
        <Route path="returns" element={<AdminReturnsPage />} />
        <Route path="email-logs" element={<AdminEmailLogs />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
