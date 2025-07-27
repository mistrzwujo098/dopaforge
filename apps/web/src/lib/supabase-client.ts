'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@dopaforge/db';

// Singleton pattern to ensure only one instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if we're in browser and have config
  if (typeof window === 'undefined') {
    return null as any;
  }

  // Get environment variables - these should be injected at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    return null as any;
  }

  try {
    // Create singleton instance with minimal config
    supabaseInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: window.localStorage,
        },
      }
    );

    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null as any;
  }
}

// Don't initialize on import - let components do it
export const supabase = null;