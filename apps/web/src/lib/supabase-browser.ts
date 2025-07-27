'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@dopaforge/db';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowser() {
  if (browserClient) return browserClient;

  // For Vercel, these should be available at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fallback check for window variables (Vercel sometimes injects them this way)
    const windowUrl = typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_SUPABASE_URL : null;
    const windowKey = typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY : null;
    
    if (windowUrl && windowKey) {
      browserClient = createBrowserClient<Database>(windowUrl, windowKey);
      return browserClient;
    }
    
    throw new Error(
      'Missing public environment variables. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.'
    );
  }

  browserClient = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );

  return browserClient;
}