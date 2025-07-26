'use client';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dopaforge/ui';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const envVars = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      description: 'Your Supabase project URL',
      example: 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co',
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      description: 'Your Supabase anonymous key',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  ];

  const isConfigured = envVars.every(env => env.value);

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">DopaForge Setup</CardTitle>
            <CardDescription className="text-lg">
              Configure your environment to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              isConfigured 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            }`}>
              {isConfigured ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Environment configured successfully!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Missing environment variables</span>
                </>
              )}
            </div>

            {/* Environment Variables */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Environment Variables</h3>
              {envVars.map((env) => (
                <div key={env.name} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {env.name}
                    </code>
                    {env.value ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{env.description}</p>
                  {!env.value && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                      <p className="font-medium mb-1">Example:</p>
                      <code className="text-xs">{env.example}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            {!isConfigured && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Setup Instructions</h3>
                
                <div className="space-y-3">
                  <h4 className="font-medium">For Local Development:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Create a <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env.local</code> file in the <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">apps/web</code> directory</li>
                    <li>Add the environment variables shown above</li>
                    <li>Restart the development server</li>
                  </ol>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <p className="text-sm font-medium mb-2">Example .env.local:</p>
                    <pre className="text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(
                        'NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key',
                        'env-template'
                      )}
                      className="mt-2 text-xs flex items-center gap-1 text-primary hover:underline"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === 'env-template' ? 'Copied!' : 'Copy template'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">For Vercel Deployment:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to your Vercel project settings</li>
                    <li>Navigate to "Environment Variables"</li>
                    <li>Add both variables for all environments</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Get your Supabase credentials:</h4>
                  <a
                    href="https://supabase.com/dashboard/project/_/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    Open Supabase Dashboard
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isConfigured && (
              <div className="text-center py-4">
                <p className="text-lg mb-4">Your environment is properly configured!</p>
                <a
                  href="/auth"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Continue to Login
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}