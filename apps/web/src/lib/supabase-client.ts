import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@dopaforge/db';

// Create a singleton instance
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  browserClient = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );

  return browserClient;
}