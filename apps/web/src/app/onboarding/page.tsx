'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { GuidedOnboarding } from '@/components/guided-onboarding';
import { useUser } from '@/hooks/useUser';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else {
        // Sprawdź czy użytkownik już przeszedł onboarding
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
        if (hasCompletedOnboarding === 'true') {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <GuidedOnboarding userId={user.id} />
    </div>
  );
}