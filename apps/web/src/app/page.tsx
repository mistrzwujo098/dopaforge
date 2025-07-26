// path: apps/web/src/app/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/auth-server';

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  redirect('/dashboard');
}