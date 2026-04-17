import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, LayoutGrid, Loader2 } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, profile, isLoading, signOut } = useAuth();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-10 h-10 text-pink-500" />
      </div>
    );
  }

  // Redirect if not logged in or not an admin
  const role = profile?.role;
  // If user is logged in but profile hasn't loaded yet, wait (avoid premature redirect)
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <LayoutGrid size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen">
        <NavLink to="/" className="text-2xl font-black text-primary mb-12 uppercase tracking-tighter">
          JT Brand<span className="text-accent">.</span>
        </NavLink>
        
        <nav className="flex-1 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Admin account card */}
        <div className="mt-6 mb-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="font-bold text-slate-900 text-sm truncate">
            {profile?.username || profile?.name || user?.email?.split('@')[0] || 'Admin'}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{profile?.email || user?.email}</p>
          <span className="mt-2 inline-block text-[10px] font-black uppercase tracking-widest bg-pink-100 text-pink-600 px-2 py-0.5 rounded-md">
            {profile?.role || 'admin'}
          </span>
        </div>

        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 font-semibold transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
