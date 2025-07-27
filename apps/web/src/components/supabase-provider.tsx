'use client';

import { useEffect } from 'react';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Log environment variables status (without exposing values)
    if (typeof window !== 'undefined') {
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!hasUrl || !hasKey) {
        console.error('Supabase configuration missing:', {
          hasUrl,
          hasKey,
          hostname: window.location.hostname,
        });
      }
    }
  }, []);

  return <>{children}</>;
}