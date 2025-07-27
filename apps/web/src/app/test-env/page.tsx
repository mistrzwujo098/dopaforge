'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@dopaforge/ui';

export default function TestEnvPage() {
  const [clientEnv, setClientEnv] = useState<any>(null);
  const [apiEnv, setApiEnv] = useState<any>(null);

  useEffect(() => {
    // Check client-side environment
    const env = {
      fromProcess: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_FOUND',
      },
      fromWindow: {
        url: (window as any).NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
        key: (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_FOUND',
      },
      nextData: (window as any).__NEXT_DATA__?.props || 'NO_NEXT_DATA',
    };
    setClientEnv(env);

    // Fetch server-side debug info
    fetch('/api/debug')
      .then(res => res.json())
      .then(data => setApiEnv(data))
      .catch(err => setApiEnv({ error: err.message }));
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Client-Side Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto p-4 bg-gray-100 dark:bg-gray-800 rounded">
              {JSON.stringify(clientEnv, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server-Side Environment (via API)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto p-4 bg-gray-100 dark:bg-gray-800 rounded">
              {JSON.stringify(apiEnv, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>If you see "NOT_FOUND" above, the environment variables are not being loaded.</p>
            <p>Make sure you have added these variables in Vercel:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Go to Vercel Dashboard → Your Project → Settings → Environment Variables
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}