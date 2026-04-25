import { createClient } from '@supabase/supabase-js';

function getRequiredEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const value = import.meta.env[name];
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }

  return name === 'VITE_SUPABASE_ANON_KEY'
    ? normalized.replace(/\s+/g, '')
    : normalized;
}

const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
