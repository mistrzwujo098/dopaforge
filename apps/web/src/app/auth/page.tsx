// path: apps/web/src/app/auth/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Prevent static generation during build
export const dynamic = 'force-dynamic';
// import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@dopaforge/ui';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast({
        title: 'Authentication Error',
        description: decodeURIComponent(error),
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createSupabaseBrowser();

      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Konto utworzone!',
          description: 'Sprawdź email aby potwierdzić rejestrację.',
        });
        
        // If email confirmation is disabled, auto-login
        if (data.user && data.session) {
          router.push('/dashboard');
        }
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session) {
          toast({
            title: 'Zalogowano!',
            description: 'Przekierowywanie do aplikacji...',
          });
          
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Błąd',
        description: error.message === 'Invalid login credentials' 
          ? 'Nieprawidłowy email lub hasło' 
          : error.message || 'Wystąpił nieoczekiwany błąd',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Twój mózg pokocha produktywność
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? 'Zacznij budować nawyki, które dają radość' : 'Wejdź i poczuj dopaminowy zastrzyk'}
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              variant={"gradient" as any}
              disabled={loading || !email || !password}
            >
              {loading ? 'Ładowanie...' : (isSignUp ? 'Zacznij przygodę' : 'Wejdź do gry')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline p-2 min-h-[48px] inline-flex items-center"
            >
              {isSignUp ? 'Masz już konto? Zaloguj się' : "Pierwszy raz? Załóż konto"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}