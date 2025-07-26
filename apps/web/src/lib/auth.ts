// path: apps/web/src/lib/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@dopaforge/db';

// Create client for client components
export const createClient = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    // Return a mock client for SSR
    return createClientComponentClient<Database>();
  }
  
  // Create actual client
  return createClientComponentClient<Database>();
};