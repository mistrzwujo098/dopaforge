'use client';

import { useState, useEffect } from 'react';
import { OnboardingModal } from './onboarding-modal';
import { FirstTaskModal } from './first-task-modal';
import { createTask } from '@/lib/db-client';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFirstTask, setShowFirstTask] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowFirstTask(true);
  };

  const handleCreateFirstTask = async (taskName: string) => {
    try {
      await createTask({
        user_id: userId,
        title: taskName,
        est_minutes: 5, // Default 5 minutes for first task
        display_order: 0,
      });
      
      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');
      
      toast({
        title: '🎉 Pierwsze zadanie utworzone!',
        description: 'Świetny początek! Ukończ je, aby zdobyć pierwsze XP.',
      });
      
      setShowFirstTask(false);
      onComplete();
      
      // Refresh the page to show the new task
      router.refresh();
    } catch (error) {
      console.error('Error creating first task:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć zadania. Spróbuj ponownie.',
        variant: 'destructive',
      });
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
    setShowFirstTask(false);
    onComplete();
  };

  return (
    <>
      <OnboardingModal
        open={showOnboarding}
        onClose={handleSkip}
        onComplete={handleOnboardingComplete}
      />
      
      <FirstTaskModal
        open={showFirstTask}
        onClose={() => {
          setShowFirstTask(false);
          handleSkip();
        }}
        onCreateTask={handleCreateFirstTask}
      />
    </>
  );
}

export { OnboardingModal } from './onboarding-modal';
export { FirstTaskModal } from './first-task-modal';