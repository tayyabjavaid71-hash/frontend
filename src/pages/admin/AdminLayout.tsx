import { useAuth } from '../../hooks/useAuth';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, LayoutGrid } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { user, profile, isLoading, signOut } = useAuth();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not logged in or not an admin
  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <LayoutGrid size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen">
        <Link to="/" className="text-2xl font-black text-primary mb-12 uppercase tracking-tighter">
          JT Brand<span className="text-accent">.</span>
        </Link>
        
        <nav className="flex-1 space-y-2">
          {links.map(l => {
            const isActive = pathname === l.path || (l.path !== '/admin' && pathname.startsWith(l.path));
            return (
              <Link 
                key={l.path} 
                to={l.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                {l.icon}
                {l.name}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 font-semibold transition-colors mt-auto"
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
