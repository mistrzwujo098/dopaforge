import { NextResponse } from 'next/server';

export async function GET() {
  // Debug environment variables (without exposing actual values)
  const debug = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debug);
}