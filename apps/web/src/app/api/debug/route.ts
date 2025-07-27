import { NextResponse } from 'next/server';

export async function GET() {
  // Debug environment variables (without exposing actual values)
  const debug = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    timestamp: new Date().toISOString(),
    // Check if they start with expected values
    urlStartsWith: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') || false,
    keyFormat: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') || false,
  };

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}