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
    console.error('Supabase configuration missing. URL:', url, 'Key exists:', !!key);
    // Throw error instead of returning mock
    throw new Error(
      'Supabase configuration missing. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables.'
    );
  }

  // Validate URL format
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    console.error('Invalid Supabase URL format:', url);
    throw new Error('Invalid Supabase URL format. It should be https://[project-ref].supabase.co');
  }

  // Clean up URL and key (remove whitespace and newlines)
  const cleanUrl = url.trim();
  const cleanKey = key.replace(/\s+/g, ''); // Remove ALL whitespace including newlines

  // Validate key format
  if (!cleanKey.startsWith('eyJ')) {
    console.error('Invalid Supabase anon key format');
    throw new Error('Invalid Supabase anon key format');
  }

  try {
    console.log('Creating Supabase client with URL:', cleanUrl.substring(0, 30) + '...');
    console.log('Key length after cleanup:', cleanKey.length);
    
    browserClient = createBrowserClient<Database>(cleanUrl, cleanKey);
    console.log('Supabase client created successfully');
    return browserClient;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw error;
  }
}