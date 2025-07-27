'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@dopaforge/ui';
import { AlertTriangle, Flame, Clock, TrendingDown, Eye } from 'lucide-react';
import { DarkPsychologyEngine, BehavioralInterrupt } from '@/lib/dark-psychology';

interface InterventionProps {
  userId: string;
  currentTasks: any[];
  lastActivity: Date;
}

export function BehavioralInterventions({ userId, currentTasks, lastActivity }: InterventionProps) {
  const [intervention, setIntervention] = useState<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    countdown?: number;
    options?: Array<{ label: string; action: string }>;
    action?: () => void;
  } | null>(null);
  const [mouseIdleTime, setMouseIdleTime] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isWatching, setIsWatching] = useState(true);

  // Śledzenie bezczynności
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let lastMouseMove = Date.now();

    const handleMouseMove = () => {
      const now = Date.now();
      const idleSeconds = Math.floor((now - lastMouseMove) / 1000);
      
      if (idleSeconds > 60) {
        setIntervention({
          type: 'idle',
          message: DarkPsychologyEngine.getMicroManipulation('task_avoid'),
          severity: 'high'
        });
      }
      
      lastMouseMove = now;
      setMouseIdleTime(0);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        
        if (tabSwitches > 2) {
          setIntervention({
            type: 'distraction',
            message: 'Znowu uciekasz? Za każde przełączenie karty tracisz 10 XP.',
            severity: 'medium',
            action: () => {
              // Implementacja kary XP
              alert('Straciłeś 10 XP za rozproszenie.');
            }
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Sprawdzanie co 30 sekund
    idleTimer = setInterval(() => {
      const idleMinutes = Math.floor((Date.now() - lastMouseMove) / 60000);
      if (idleMinutes > 2) {
        setIntervention({
          type: 'abandonment',
          message: 'Wykryto porzucenie. Wracaj NATYCHMIAST albo stracisz streak.',
          severity: 'critical',
          countdown: 60
        });
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(idleTimer);
    };
  }, [tabSwitches]);

  // Analiza wzorców prokrastynacji
  useEffect(() => {
    const analyzeBehavior = () => {
      // Brak zadań = unikanie
      if (currentTasks.length === 0) {
        const hoursSinceLastTask = (Date.now() - lastActivity.getTime()) / 3600000;
        
        if (hoursSinceLastTask > 2) {
          setIntervention({
            type: 'avoidance',
            message: `${Math.floor(hoursSinceLastTask)} godzin bez działania. Co się dzieje?`,
            severity: 'high',
            options: [
              { label: 'Jestem przytłoczony', action: 'micro_task' },
              { label: 'Nie wiem od czego zacząć', action: 'random_task' },
              { label: 'Czekam na motywację', action: 'force_start' }
            ]
          });
        }
      }

      // Za dużo niezakończonych = paraliż
      const pendingTasks = currentTasks.filter(t => t && t.status === 'pending');
      if (pendingTasks.length > 5) {
        setIntervention({
          type: 'overwhelm',
          message: 'Za dużo otwartych zadań. Wybierz JEDNO i skup się tylko na nim.',
          severity: 'medium',
          action: () => {
            // Ukryj wszystkie zadania oprócz jednego
            const randomTask = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
            alert(`FOCUS: "${randomTask.title}". Reszta znika na 25 minut.`);
          }
        });
      }
    };

    const behaviorTimer = setInterval(analyzeBehavior, 60000); // Co minutę
    analyzeBehavior(); // Pierwsze sprawdzenie

    return () => clearInterval(behaviorTimer);
  }, [currentTasks, lastActivity]);

  // System eskalacji
  const escalateIntervention = () => {
    if (!intervention) return;

    const escalations = {
      low: () => {
        // Delikatne przypomnienie
        new Notification('Hej, wróć do pracy', {
          body: intervention.message,
          icon: '/icon-192.png'
        });
      },
      medium: () => {
        // Blokada rozrywki
        if (confirm('Zablokować media społecznościowe na 30 minut?')) {
          localStorage.setItem('distraction_block', Date.now().toString());
          alert('Blokada aktywna. Czas na pracę.');
        }
      },
      high: () => {
        // Groźba konsekwencji
        const consequence = DarkPsychologyEngine.generateConsequence();
        if (confirm(`${consequence.message}. Kontynuować prokrastynację?`)) {
          // Implementacja konsekwencji
          alert('Konsekwencje zostały zapisane w Twoim profilu.');
        }
      },
      critical: () => {
        // Ostateczna interwencja
        alert('DOŚĆ. System przechodzi w tryb LOCKDOWN. Tylko praca dozwolona.');
        document.body.style.filter = 'grayscale(100%)';
        setTimeout(() => {
          document.body.style.filter = 'none';
        }, 1800000); // 30 minut
      }
    };

    escalations[intervention.severity]?.();
  };

  if (!intervention || !isWatching) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <Card className={`p-4 shadow-lg border-2 ${
          intervention.severity === 'critical' ? 'border-red-500 animate-pulse' :
          intervention.severity === 'high' ? 'border-orange-500' :
          intervention.severity === 'medium' ? 'border-yellow-500' :
          'border-blue-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              intervention.severity === 'critical' ? 'bg-red-100 text-red-600' :
              intervention.severity === 'high' ? 'bg-orange-100 text-orange-600' :
              intervention.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {intervention.type === 'idle' ? <Clock className="h-5 w-5" /> :
               intervention.type === 'distraction' ? <Eye className="h-5 w-5" /> :
               intervention.type === 'overwhelm' ? <TrendingDown className="h-5 w-5" /> :
               intervention.type === 'abandonment' ? <Flame className="h-5 w-5" /> :
               <AlertTriangle className="h-5 w-5" />}
            </div>
            
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">
                {intervention.type === 'idle' ? 'Wykryto Bezczynność' :
                 intervention.type === 'distraction' ? 'Rozproszenie Uwagi' :
                 intervention.type === 'overwhelm' ? 'Paraliż Decyzyjny' :
                 intervention.type === 'abandonment' ? 'Porzucenie Zadania' :
                 'Interwencja Behawioralna'}
              </p>
              
              <p className="text-sm text-muted-foreground mb-3">
                {intervention.message}
              </p>

              {intervention.countdown && <CountdownBar seconds={intervention.countdown} />}

              {intervention.options ? (
                <div className="space-y-2">
                  {intervention.options.map((option: any, index: number) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        handleInterventionResponse(option.action);
                        setIntervention(null);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      escalateIntervention();
                      setIntervention(null);
                    }}
                  >
                    Działam
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTabSwitches(prev => prev + 1);
                      setIntervention(null);
                    }}
                  >
                    Ignoruj
                  </Button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsWatching(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function CountdownBar({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-3">
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: seconds, ease: 'linear' }}
          className="h-full bg-red-500"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{timeLeft}s pozostało</p>
    </div>
  );
}

function handleInterventionResponse(action: string) {
  switch (action) {
    case 'micro_task':
      // Sugeruj zadanie 2-minutowe
      alert('Ok, zacznij od tego: "Otwórz dokument i napisz pierwsze zdanie"');
      break;
    case 'random_task':
      // Wybierz losowe zadanie
      alert('System wybrał za Ciebie. Nie myśl, działaj.');
      break;
    case 'force_start':
      // Wymuś start z timerem
      alert('Timer 2 minuty wystartował. DZIAŁAJ.');
      break;
  }
}