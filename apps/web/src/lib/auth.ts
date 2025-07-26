// path: apps/web/src/lib/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@dopaforge/db';

// Re-export the supabase client from db package for consistency
export { supabase as createClient } from '@dopaforge/db';