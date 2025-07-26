// path: apps/web/src/lib/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@dopaforge/db';

export const createClient = () => {
  return createClientComponentClient<Database>();
};