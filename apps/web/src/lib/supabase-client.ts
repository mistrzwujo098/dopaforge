'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@dopaforge/db';

// These will be replaced at build time by Next.js
const supabaseUrl = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost'
    ? 'http://localhost:54321' // Local development
    : process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  : process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      // Return a mock client that will fail gracefully
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
          onAuthStateChange: () => ({ data: { subscription: null } }),
        },
      } as any;
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    });
  }

  return supabaseClient;
}

// Export for backwards compatibility
export const supabase = getSupabaseClient();