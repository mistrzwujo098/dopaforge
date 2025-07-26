'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/auth';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@dopaforge/ui';

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session check:', { session, error });
    setSession(session);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Auth Debug Page</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(
              {
                hasSession: !!session,
                user: session?.user?.email,
                expiresAt: session?.expires_at,
                provider: session?.user?.app_metadata?.provider,
              },
              null,
              2
            )}
          </pre>
          
          {session && (
            <Button onClick={signOut} className="mt-4">
              Sign Out
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}