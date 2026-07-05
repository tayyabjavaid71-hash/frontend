import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { logTikTokEvent } from '../services/tiktokEventLogger';
import { identifyTikTokUser } from '../utils/tiktokPixel';
import { API } from '../services/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      // 1. Create Supabase auth user
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // data.user is always set on success (even when email confirmation is required)
      // data.session is null when email confirmation is required
      const userId = data.user?.id;
      if (!userId) {
        setError('Signup failed — please try again.');
        setLoading(false);
        return;
      }

      // 2. Save profile row in DB (only profiles table — users table has password_hash NOT NULL)
      await API.post('/users', { id: userId, email, name, role: 'customer' });

      // If no session, Supabase requires email confirmation
      if (!data.session) {
        setError(null);
        setSuccess(true);
        // Show confirmation message instead of redirecting to login
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      setSuccess(true);
      // TikTok Pixel — CompleteRegistration + identify
      logTikTokEvent({ eventName: 'CompleteRegistration', productId: userId, productName: name, value: 0, currency: 'PKR' });
      identifyTikTokUser(email, '', userId);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create account.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800">
      
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10 text-center sm:text-left">
            <Link to="/" className="text-3xl font-black text-primary tracking-tight block mb-8">
              JT <span className="text-accent">Collections</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
            <p className="text-slate-500">Join our exclusive community of luxury fashion.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm font-medium"
              >
                Account created! Check your email to confirm, then login…
              </motion.div>
            )}
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required 
                  type="text" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required 
                  type="email" 
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required 
                  type="password" 
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group w-full bg-primary hover:bg-primary-light text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>Sign Up <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600">
            Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Image Cover for desktop */}
      <div className="hidden lg:block lg:flex-1 relative">
        <div className="absolute inset-0 bg-primary/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b" 
          alt="Fashion Register Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-12 right-12 z-20">
          <span className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full font-bold text-primary shadow-lg uppercase tracking-wider text-sm">
            Fast Checkout
          </span>
        </div>
      </div>
      
    </div>
  );
};
