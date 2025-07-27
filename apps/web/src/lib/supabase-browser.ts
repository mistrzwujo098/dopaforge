'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@dopaforge/db';

// Store instance
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Debug function to check environment
function getEnvVars() {
  // Try different ways to get env vars
  const fromProcess = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  
  const fromWindow = typeof window !== 'undefined' ? {
    url: (window as any).NEXT_PUBLIC_SUPABASE_URL || (window as any).__NEXT_DATA__?.props?.pageProps?.env?.NEXT_PUBLIC_SUPABASE_URL,
    key: (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || (window as any).__NEXT_DATA__?.props?.pageProps?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  } : { url: undefined, key: undefined };

  // Return first valid set
  if (fromProcess.url && fromProcess.key) {
    return fromProcess;
  }
  
  if (fromWindow.url && fromWindow.key) {
    return fromWindow;
  }

  // Debug logging
  console.error('Environment variables not found:', {
    processEnv: !!fromProcess.url && !!fromProcess.key,
    windowEnv: !!fromWindow.url && !!fromWindow.key,
    processUrl: fromProcess.url?.substring(0, 20) + '...',
    windowUrl: fromWindow.url?.substring(0, 20) + '...',
  });

  return { url: undefined, key: undefined };
}

export function createSupabaseBrowser() {
  // Return existing instance
  if (browserClient) return browserClient;

  // Get environment variables
  const { url, key } = getEnvVars();

  if (!url || !key) {
    console.error('Supabase configuration missing. Please check environment variables in Vercel.');
    // Return a mock that won't crash the app
    return {
      auth: {
        signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }

  try {
    browserClient = createBrowserClient<Database>(url, key);
    console.log('Supabase client created successfully');
    return browserClient;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw error;
  }
}