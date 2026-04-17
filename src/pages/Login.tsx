import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

export const Login: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Set to true after a successful Supabase sign-in so the effect below can navigate
  const [awaitingProfile, setAwaitingProfile] = useState(false);

  // Once Supabase sign-in succeeds, AuthContext loads the profile via onAuthStateChange.
  // Watch for that to complete and navigate based on the real role from the database.
  useEffect(() => {
    if (!awaitingProfile) return;
    if (auth?.isLoading) return; // still loading — wait
    if (!auth?.profile) return; // profile not set yet — wait

    setAwaitingProfile(false);
    if (auth.profile.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/shop', { replace: true });
    }
  }, [awaitingProfile, auth?.isLoading, auth?.profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Block the Supabase call entirely when offline
      if (!navigator.onLine) {
        setError('No internet connection. Click "Demo Admin Login" below to access the dashboard offline.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        throw new Error(authError?.message || 'Invalid credentials');
      }

      // Supabase sign-in succeeded — AuthContext.onAuthStateChange will fire,
      // load the profile, then the useEffect above will navigate to the right page.
      setAwaitingProfile(true);
    } catch (err: any) {
      const isOffline = err?.message?.includes('Failed to fetch') || !navigator.onLine;
      if (isOffline) {
        setError('No internet connection. Use the "Demo Admin Login" button below to access the dashboard offline.');
      } else {
        setError(err?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = { id: 'demo-admin', email: 'admin@jtcollections.com' };
    const demoProfile = { id: 'demo-admin', role: 'admin' as const, name: 'Demo Admin', email: 'admin@jtcollections.com' };
    auth?.setUser(demoUser);
    auth?.setProfile(demoProfile);
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            JT <span className="text-pink-500">Collections</span>
          </h1>
          <p className="text-slate-400">Admin Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jtcollections.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-sm text-slate-500">or</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full border-2 border-slate-200 hover:border-pink-500 text-slate-700 hover:text-pink-500 font-bold py-3 rounded-lg transition"
          >
            Demo Admin Login (Offline)
          </button>

          {/* Info Text */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Use Demo Login when internet is unavailable
          </p>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600 mt-4">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-pink-500 hover:text-pink-600 hover:underline transition"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>🛍️ JT Collections E-Commerce Platform</p>
          <p className="mt-2">Production Ready System</p>
        </div>
      </div>
    </div>
  );
};
