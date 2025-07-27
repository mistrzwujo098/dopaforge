'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@dopaforge/ui';
import { HelpCircle, X, ChevronRight, AlertCircle } from 'lucide-react';
import { DarkPsychologyEngine } from '@/lib/dark-psychology';

interface Hint {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover' | 'click' | 'idle' | 'first-visit';
  urgency?: boolean;
  action?: () => void;
}

export function InteractiveHints() {
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [dismissedHints, setDismissedHints] = useState<string[]>([]);
  const [idleTime, setIdleTime] = useState(0);

  const hints: Hint[] = [
    {
      id: 'create-task',
      target: '[data-hint="create-task"]',
      title: 'Zacznij tutaj!',
      content: 'Stwórz swoje pierwsze zadanie. Pamiętaj - maksymalnie 25 minut!',
      position: 'bottom',
      trigger: 'first-visit',
      urgency: true,
    },
    {
      id: 'task-duration',
      target: '[data-hint="task-duration"]',
      title: 'Sekret produktywności',
      content: '2-5 minut = łatwe rozpoczęcie. 10-15 minut = optymalne skupienie. 20-25 minut = maksimum przed przerwą.',
      position: 'left',
      trigger: 'hover',
    },
    {
      id: 'empty-state',
      target: '[data-hint="empty-state"]',
      title: 'Pustka = Prokrastynacja',
      content: 'Brak zadań = brak dopaminy. Dodaj TERAZ choć jedno!',
      position: 'top',
      trigger: 'idle',
      urgency: true,
      action: () => document.querySelector<HTMLButtonElement>('[data-hint="create-task"]')?.click(),
    },
    {
      id: 'start-task',
      target: '[data-hint="start-task"]',
      title: 'Nie myśl, działaj!',
      content: 'Kliknij START i zobacz jak timer odmienia Twoje życie.',
      position: 'right',
      trigger: 'hover',
    },
    {
      id: 'lootbox',
      target: '[data-hint="lootbox"]',
      title: 'Nagroda czeka!',
      content: 'Każde ukończone zadanie przybliża Cię do nagrody. Nieprzewidywalność = więcej dopaminy!',
      position: 'left',
      trigger: 'click',
    },
    {
      id: 'streak',
      target: '[data-hint="streak"]',
      title: 'Nie przerywaj serii!',
      content: 'Każdy dzień to +1 do serii. Stracisz ją = stracisz postęp.',
      position: 'bottom',
      trigger: 'hover',
      urgency: true,
    },
  ];

  // Śledzenie czasu bezczynności
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    const resetIdle = () => {
      setIdleTime(0);
    };

    const incrementIdle = () => {
      setIdleTime(prev => {
        const newTime = prev + 1;
        
        // Po 30 sekundach bezczynności pokaż podpowiedź
        if (newTime === 30) {
          const idleHints = hints.filter(h => h.trigger === 'idle' && !dismissedHints.includes(h.id));
          if (idleHints.length > 0) {
            setActiveHint(idleHints[0].id);
          }
        }
        
        return newTime;
      });
    };

    // Nasłuchuj aktywności
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('click', resetIdle);
    window.addEventListener('keypress', resetIdle);

    // Zwiększaj licznik co sekundę
    idleTimer = setInterval(incrementIdle, 1000);

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('click', resetIdle);
      window.removeEventListener('keypress', resetIdle);
      clearInterval(idleTimer);
    };
  }, [dismissedHints]);

  // Pokaż podpowiedzi dla pierwszej wizyty
  useEffect(() => {
    const firstVisitHints = hints.filter(
      h => h.trigger === 'first-visit' && !dismissedHints.includes(h.id)
    );
    
    if (firstVisitHints.length > 0) {
      setTimeout(() => {
        setActiveHint(firstVisitHints[0].id);
      }, 1000);
    }
  }, []);

  // Ustaw event listeners dla hover/click
  useEffect(() => {
    const handleInteraction = (event: Event, trigger: 'hover' | 'click') => {
      const target = event.target as HTMLElement;
      const hintElement = target.closest('[data-hint]');
      
      if (hintElement) {
        const hintId = hintElement.getAttribute('data-hint');
        const hint = hints.find(h => 
          h.target.includes(hintId!) && 
          h.trigger === trigger && 
          !dismissedHints.includes(h.id)
        );
        
        if (hint) {
          setActiveHint(hint.id);
        }
      }
    };

    const handleMouseEnter = (e: Event) => handleInteraction(e, 'hover');
    const handleClick = (e: Event) => handleInteraction(e, 'click');

    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, [dismissedHints]);

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => [...prev, hintId]);
    setActiveHint(null);
    localStorage.setItem('dismissedHints', JSON.stringify([...dismissedHints, hintId]));
  };

  const currentHint = hints.find(h => h.id === activeHint);

  if (!currentHint) return null;

  const targetElement = document.querySelector(currentHint.target);
  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const position = calculatePosition(rect, currentHint.position);

  return (
    <AnimatePresence>
      <motion.div
        key={currentHint.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed',
          ...position,
          zIndex: 9999,
        }}
        className="pointer-events-none"
      >
        <Card className={`
          pointer-events-auto shadow-lg border-2 max-w-sm
          ${currentHint.urgency ? 'border-orange-500 animate-pulse' : 'border-primary'}
        `}>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {currentHint.urgency ? (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                ) : (
                  <HelpCircle className="h-5 w-5 text-primary" />
                )}
                <h3 className="font-semibold">{currentHint.title}</h3>
              </div>
              <button
                onClick={() => dismissHint(currentHint.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {currentHint.content}
            </p>

            {currentHint.action && (
              <button
                onClick={() => {
                  currentHint.action!();
                  dismissHint(currentHint.id);
                }}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Pokaż mi <ChevronRight className="h-3 w-3" />
              </button>
            )}

            {idleTime > 60 && currentHint.trigger === 'idle' && (
              <p className="text-xs text-orange-500 mt-2">
                Bezczynny od {Math.floor(idleTime / 60)} minut...
              </p>
            )}
          </div>
        </Card>

        {/* Strzałka wskazująca */}
        <div 
          className={`
            absolute w-0 h-0 border-8 border-transparent
            ${currentHint.urgency ? 'border-orange-500' : 'border-primary'}
          `}
          style={getArrowStyle(currentHint.position)}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function calculatePosition(rect: DOMRect, position: string) {
  const offset = 16;
  
  switch (position) {
    case 'top':
      return {
        left: rect.left + rect.width / 2,
        bottom: window.innerHeight - rect.top + offset,
        transform: 'translateX(-50%)',
      };
    case 'bottom':
      return {
        left: rect.left + rect.width / 2,
        top: rect.bottom + offset,
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        right: window.innerWidth - rect.left + offset,
        top: rect.top + rect.height / 2,
        transform: 'translateY(-50%)',
      };
    case 'right':
      return {
        left: rect.right + offset,
        top: rect.top + rect.height / 2,
        transform: 'translateY(-50%)',
      };
  }
}

function getArrowStyle(position: string) {
  switch (position) {
    case 'top':
      return {
        bottom: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderTopColor: 'inherit',
      };
    case 'bottom':
      return {
        top: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderBottomColor: 'inherit',
      };
    case 'left':
      return {
        right: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderLeftColor: 'inherit',
      };
    case 'right':
      return {
        left: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRightColor: 'inherit',
      };
  }
}