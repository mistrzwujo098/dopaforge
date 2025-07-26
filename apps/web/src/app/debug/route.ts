import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  return NextResponse.json({
    session: session ? {
      user: session.user.email,
      expires: session.expires_at,
      access_token: session.access_token ? 'exists' : 'missing'
    } : null,
    user: user ? {
      id: user.id,
      email: user.email,
      created: user.created_at
    } : null,
    sessionError: sessionError?.message,
    userError: userError?.message,
    cookies: cookieStore.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))
  });
}