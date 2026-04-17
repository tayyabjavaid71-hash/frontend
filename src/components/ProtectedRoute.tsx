import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required role to access this route. Defaults to 'admin'. */
  role?: 'admin' | 'customer';
  /** Where to redirect unauthenticated / unauthorized users. Defaults to /login. */
  redirectTo?: string;
}

/**
 * Route guard that checks authentication and (optionally) role before rendering children.
 * - Shows a spinner while the auth context is still loading.
 * - Redirects to `redirectTo` if the user is not authenticated.
 * - Redirects to `redirectTo` if the user does not have the required role.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role = 'admin',
  redirectTo = '/login',
}) => {
  const { user, profile, isLoading } = useAuth();

  // Show spinner while auth OR profile is loading
  if (isLoading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-10 h-10 text-pink-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (role === 'admin' && profile?.role !== 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
