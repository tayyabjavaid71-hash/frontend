import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { API, setApiToken } from '../services/api';

type AuthProfile = {
  id: string;
  email?: string;
  role?: string;
  full_name?: string;
  name?: string;
  username?: string;
};

type AuthContextValue = {
  user: any;
  profile: AuthProfile | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setProfile: React.Dispatch<React.SetStateAction<AuthProfile | null>>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string, userEmail?: string) => {
    // ── 0. Ensure profile row exists (so role/name is available)  ────────
    // upsert into profiles — ignoreDuplicates means no-op if already exists
    try {
      await supabase.from('profiles').upsert(
        { id: userId, name: userEmail?.split('@')[0] || 'User', role: 'user' },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    } catch {
      // Non-fatal — silently continue
    }

    // ── 1. Backend GET /api/users/:id with real Supabase JWT ──────────────
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const { data: json } = await API.get(`/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (json) {
        const u = json.user ?? {};
        setProfile({
          id:       u.id      ?? userId,
          email:    u.email   ?? userEmail,   // fallback to Supabase session email
          role:     u.role,
          name:     u.name,
          username: u.username,
        });
        return;
      }
    } catch {
      // backend unreachable — fall through to direct Supabase attempts
    }

    // ── 2. Direct Supabase → users table (no RLS in original schema) ──────
    try {
      const { data: fromUsers, error: usersErr } = await supabase
        .from('users')
        .select('id, email, role, name')
        .eq('id', userId)
        .maybeSingle();

      if (!usersErr && fromUsers) {
        setProfile({
          id:    fromUsers.id,
          email: fromUsers.email,
          role:  fromUsers.role,
          name:  fromUsers.name,
        });
        return;
      }
    } catch {
      // RLS or schema error — fall through
    }

    // ── 3. Use session metadata as last resort ────────────────────────────
    if (userEmail) {
      setProfile({ id: userId, email: userEmail, role: 'user' });
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        // Push token into the API store immediately so adminService never reads a stale one
        setApiToken(data.session?.access_token ?? null);
        if (!mounted) return;
        setUser(sessionUser);
        if (sessionUser?.id) {
          await loadUserProfile(sessionUser.id, sessionUser.email);
        } else {
          setProfile(null);
        }
      } catch {
        // Offline or network error — continue without a session
        if (!mounted) return;
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    bootstrapAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Always sync the token store first — this is what adminService reads
      setApiToken(session?.access_token ?? null);
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser?.id) {
        // Load profile then clear loading — keeps ProtectedRoute from
        // seeing isLoading=false with profile=null and redirecting to /login.
        setIsLoading(true);
        loadUserProfile(nextUser.id, nextUser.email)
          .catch(() => { if (mounted) setProfile(null); })
          .finally(() => { if (mounted) setIsLoading(false); });
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ user, profile, isLoading, setUser, setProfile, signOut }),
    [user, profile, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
