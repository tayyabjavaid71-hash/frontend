import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';

type AuthProfile = {
  id: string;
  email?: string;
  role?: 'admin' | 'customer' | 'user';
  full_name?: string;
  name?: string;
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

  const loadUserProfile = useCallback(async (userId: string) => {
    const { data: fromUsers } = await supabase
      .from('users')
      .select('id, email, role, name')
      .eq('id', userId)
      .maybeSingle();

    if (fromUsers) {
      setProfile({
        id: fromUsers.id,
        email: fromUsers.email,
        role: fromUsers.role,
        name: fromUsers.name,
      });
      return;
    }

    const { data: fromProfiles } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (fromProfiles) {
      setProfile({
        id: fromProfiles.id,
        email: fromProfiles.email,
        role: fromProfiles.role,
        full_name: fromProfiles.full_name,
      });
      return;
    }

    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        if (!mounted) return;
        setUser(sessionUser);
        if (sessionUser?.id) {
          await loadUserProfile(sessionUser.id);
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser?.id) {
        await loadUserProfile(nextUser.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
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
