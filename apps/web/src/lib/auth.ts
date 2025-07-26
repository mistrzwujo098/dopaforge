// path: apps/web/src/lib/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@dopaforge/db';
import { supabase } from '@dopaforge/db';

// Export function instead of re-export to avoid build issues
export const createClient = () => supabase;