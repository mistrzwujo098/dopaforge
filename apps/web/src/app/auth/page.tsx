// path: apps/web/src/app/auth/page.tsx
'use client';

import React, { useState } from 'react';

// Prevent static generation during build
export const dynamic = 'force-dynamic';
// import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@dopaforge/ui';
import { useToast } from '@/hooks/useToast';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  // const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Authentication service is not configured. Please check environment variables.');
      }

      const { error } = isSignUp 
        ? await supabase.auth.signInWithOtp({ 
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
          })
        : await supabase.auth.signInWithOtp({ 
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
          });

      if (error) throw error;

      toast({
        title: 'Check your email',
        description: 'We sent you a magic link to sign in.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to DopaForge
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? 'Create an account to start building habits' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              variant={"gradient" as any}
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : `Send Magic Link`}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}