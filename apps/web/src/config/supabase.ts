// Supabase configuration with fallbacks
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Validate configuration
export function validateSupabaseConfig() {
  const missing = [];
  
  if (!supabaseConfig.url) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!supabaseConfig.anonKey) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (missing.length > 0) {
    console.error(`Missing Supabase environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}