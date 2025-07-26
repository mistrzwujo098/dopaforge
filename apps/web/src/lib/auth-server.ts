// path: apps/web/src/lib/auth-server.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@dopaforge/db';

export const createServerClient = () => {
  const cookieStore = cookies();
  
  // Check if we have environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return a mock client for build time
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    } as any;
  }
  
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};