'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@dopaforge/ui';
import { ChevronRight, AlertCircle, Zap, Target, Brain } from 'lucide-react';
import { DarkPsychologyEngine } from '@/lib/dark-psychology';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '@/lib/db-client';
import { useToast } from '@/hooks/useToast';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  action: () => void;
  urgency?: string;
  consequence?: string;
  microManipulation?: string;
}

export function GuidedOnboarding({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState(0);
  const [commitment, setCommitment] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'confession',
      title: 'Przyznaj się do prawdy',
      content: 'Zanim zaczniemy - wybierz co Cię najbardziej opisuje:',
      action: () => {},
      microManipulation: 'Szczerość to pierwszy krok do zmiany'
    },
    {
      id: 'panic-threshold',
      title: 'Twój Próg Paniki',
      content: 'Ile godzin przed deadline\'em zaczynasz działać?',
      action: () => {},
      urgency: 'To kluczowe - bez tego system nie zadziała'
    },
    {
      id: 'commitment',
      title: 'Pakt z Diabłem',
      content: 'Czas na zobowiązanie. Co postawisz na szali?',
      action: () => {},
      consequence: 'Bez stawki będziesz się wymigiwać jak zawsze'
    },
    {
      id: 'first-task',
      title: 'Pierwsze Zadanie - TERAZ',
      content: 'Nie jutro. Nie za godzinę. TERAZ. 2 minuty.',
      action: () => router.push('/dashboard'),
      urgency: 'Masz 30 sekund na decyzję zanim system Cię wyloguje',
      microManipulation: 'To tylko 2 minuty. Co możesz stracić?'
    }
  ];

  useEffect(() => {
    // Auto-progress z urgencją
    const timer = setTimeout(() => {
      if (currentStep === steps.length - 1) {
        alert('Czas minął. Zaczynam od nowa.');
        setCurrentStep(0);
      }
    }, 30000); // 30 sekund na ostatni krok

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleSkip = () => {
    setSkippedSteps(prev => prev + 1);
    if (skippedSteps >= 2) {
      alert('Za dużo pomijania. Widać że uciekasz przed zmianą. Wracamy do początku.');
      setCurrentStep(0);
      setSkippedSteps(0);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'confession':
        return (
          <div className="space-y-3">
            <Button
              onClick={() => {
                localStorage.setItem('procrastination_type', 'last_minute');
                setCurrentStep(currentStep + 1);
              }}
              variant="outline"
              className="w-full justify-start"
            >
              😰 Robię wszystko na ostatnią chwilę
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('procrastination_type', 'perfectionist');
                setCurrentStep(currentStep + 1);
              }}
              variant="outline"
              className="w-full justify-start"
            >
              🎯 Czekam na "idealny moment" (który nigdy nie nadchodzi)
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('procrastination_type', 'overwhelmed');
                setCurrentStep(currentStep + 1);
              }}
              variant="outline"
              className="w-full justify-start"
            >
              😵 Planuję za dużo i się paraliżuję
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('procrastination_type', 'rebel');
                setCurrentStep(currentStep + 1);
              }}
              variant="outline"
              className="w-full justify-start"
            >
              🤘 Buntuję się przeciwko własnym planom
            </Button>
          </div>
        );

      case 'panic-threshold':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 6, 12, 24, 48].map(hours => (
                <Button
                  key={hours}
                  onClick={() => {
                    localStorage.setItem('panic_threshold', hours.toString());
                    setCurrentStep(currentStep + 1);
                  }}
                  variant={hours <= 6 ? 'destructive' : 'outline'}
                >
                  {hours}h przed
                </Button>
              ))}
            </div>
            <p className="text-sm text-red-500">
              ⚠️ System będzie tworzył sztuczną presję {localStorage.getItem('panic_threshold') || '6'}h wcześniej
            </p>
          </div>
        );

      case 'commitment':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Co jest dla Ciebie ważne? (np. reputacja, pieniądze)"
              className="w-full p-3 border rounded-lg"
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
            />
            {commitment && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  ⚠️ OSTRZEŻENIE: Potwierdzając, zgadzasz się że:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1">
                  <li>• System może publicznie ujawnić Twoje niepowodzenia</li>
                  <li>• Stracisz {commitment} jeśli nie dotrzymasz słowa</li>
                  <li>• NIE MA OPCJI COFNIĘCIA</li>
                </ul>
              </div>
            )}
            <Button
              onClick={() => {
                if (!commitment) {
                  alert('Bez zobowiązania = bez zmiany. Wpisz coś.');
                  return;
                }
                localStorage.setItem('commitment_stake', commitment);
                setCurrentStep(currentStep + 1);
              }}
              variant="destructive"
              disabled={!commitment}
              className="w-full"
            >
              Potwierdzam - stawiam {commitment || '...'} na szali
            </Button>
          </div>
        );

      case 'first-task':
        return (
          <div className="space-y-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg animate-pulse">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5" />
                <CountdownTimer seconds={30} onComplete={() => {
                  alert('Czas minął. Restart.');
                  setCurrentStep(0);
                }} />
              </div>
            </div>
            <div className="space-y-3">
              <Button
                onClick={async () => {
                  if (isCompleting) return;
                  setIsCompleting(true);
                  
                  try {
                    // Zapisz w localStorage dla kompatybilności
                    localStorage.setItem('onboarding_completed', 'true');
                    
                    // Zapisz w bazie danych
                    await updateUserProfile(userId, {
                      has_completed_onboarding: true,
                      onboarding_completed_at: new Date().toISOString(),
                      onboarding_data: {
                        procrastination_type: localStorage.getItem('procrastination_type'),
                        panic_threshold: localStorage.getItem('panic_threshold'),
                        commitment: commitment
                      }
                    } as any);
                    
                    router.push('/dashboard');
                  } catch (error) {
                    console.error('Error completing onboarding:', error);
                    toast({
                      title: 'Błąd zapisu',
                      description: 'Nie udało się zapisać postępu. Spróbuj ponownie.',
                      variant: 'destructive'
                    });
                    setIsCompleting(false);
                  }
                }}
                disabled={isCompleting}
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Zap className="mr-2" />
                START - Działam TERAZ
              </Button>
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Może później... (tchórz)
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-lg mx-auto"
      >
        <Card className="p-6">
          <div className="mb-6">
            {/* Progress bar z urgencją */}
            <div className="flex items-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= currentStep
                      ? currentStep === steps.length - 1
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-primary'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].content}</p>

            {steps[currentStep].urgency && (
              <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                  ⏰ {steps[currentStep].urgency}
                </p>
              </div>
            )}

            {steps[currentStep].consequence && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  ⚠️ {steps[currentStep].consequence}
                </p>
              </div>
            )}

            {steps[currentStep].microManipulation && (
              <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                  💭 {steps[currentStep].microManipulation}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            {renderStepContent()}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function CountdownTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  return (
    <span className="font-mono font-bold">
      {timeLeft}s do automatycznego restartu
    </span>
  );
}