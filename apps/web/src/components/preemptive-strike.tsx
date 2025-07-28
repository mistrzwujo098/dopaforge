'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '@dopaforge/ui';
import { Shield, Zap, Brain, Target, AlertTriangle } from 'lucide-react';
import { AntiEscapeSystem } from '@/lib/anti-escape-system';
import { DarkPsychologyEngine } from '@/lib/dark-psychology';

interface PreemptiveStrikeProps {
  userId: string;
  onActionRequired: (action: string) => void;
}

export function PreemptiveStrike({ userId, onActionRequired }: PreemptiveStrikeProps) {
  const [activeStrikes, setActiveStrikes] = useState<any[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<string>('');

  useEffect(() => {
    const checkVulnerableHours = () => {
      const hour = new Date().getHours();
      const procrastinationType = localStorage.getItem('procrastination_type');
      
      // Wykryj "godziny słabości" na podstawie typu
      const vulnerableHours: Record<string, number[]> = {
        'last_minute': [9, 10, 11, 14, 15], // Rano i po lunchu
        'perfectionist': [8, 9, 20, 21], // Start dnia i wieczór
        'overwhelmed': [10, 11, 15, 16], // Środek dnia
        'rebel': [9, 13, 17, 19] // Losowe godziny
      };
      
      const dangerous = vulnerableHours[procrastinationType || 'last_minute'].includes(hour);
      
      if (dangerous) {
        generatePreemptiveStrike(hour);
      }
    };

    // Sprawdzaj co 30 minut
    const interval = setInterval(checkVulnerableHours, 1800000);
    checkVulnerableHours(); // Pierwsze sprawdzenie

    return () => clearInterval(interval);
  }, []);

  const generatePreemptiveStrike = (hour: number) => {
    const strikes = [];

    // Poranny atak
    if (hour >= 8 && hour <= 10) {
      strikes.push({
        id: 'morning-attack',
        type: 'morning',
        title: '🌅 Poranna Pułapka Wykryta',
        message: 'Za 5 minut zaczniesz scrollować. Wyprzedzam to.',
        action: 'Stwórz 3 zadania TERAZ zanim mózg się obudzi',
        urgency: 'high',
        countdown: 300 // 5 minut
      });
    }

    // Post-lunch dip
    if (hour >= 13 && hour <= 15) {
      strikes.push({
        id: 'post-lunch',
        type: 'energy-dip',
        title: '🍕 Spadek Energii za 15 minut',
        message: 'Poziom glukozy spadnie. Prokrastynacja uderzy.',
        action: 'Przygotuj 1 łatwe zadanie na "zombie mode"',
        urgency: 'medium',
        suggestion: 'Zadanie mechaniczne, nie wymagające myślenia'
      });
    }

    // Wieczorna ucieczka
    if (hour >= 19 && hour <= 21) {
      strikes.push({
        id: 'evening-escape',
        type: 'end-day',
        title: '🌙 Wieczorna Wymówka Nadchodzi',
        message: '"Za późno żeby zaczynać" - znam ten trick',
        action: 'Jedno 5-minutowe zadanie. Zakończ dzień zwycięstwem.',
        urgency: 'critical',
        reward: 'Bonus 2x XP za wieczorne zadanie'
      });
    }

    // Piątkowy syndrom
    if (new Date().getDay() === 5 && hour >= 14) {
      strikes.push({
        id: 'friday-syndrome',
        type: 'weekend-trap',
        title: '📅 Piątkowa Pułapka',
        message: 'Weekend = wymówka. Nie daj się złapać.',
        action: 'Ustaw 1 zadanie na sobotę TERAZ',
        urgency: 'high',
        consequence: 'Brak zadania = -200 XP w poniedziałek'
      });
    }

    setActiveStrikes(strikes);
  };

  // System "Prokrastynacja przez socjale"
  const detectSocialMediaUrge = () => {
    const lastCheck = localStorage.getItem('last_social_check');
    const minutesSince = lastCheck ? 
      (Date.now() - parseInt(lastCheck)) / 60000 : 60;
    
    if (minutesSince > 30) {
      return {
        urgeLevel: 'high',
        intervention: 'Czujesz FOMO? To zaprojektowane uzależnienie. Pokonaj je.',
        alternative: 'Sprawdź social TYLKO po ukończeniu 1 zadania.',
        reward: '+50 XP za odporność na pokusę'
      };
    }
    
    return null;
  };

  // System wykrywania "Overwhelm" przed wystąpieniem
  const predictOverwhelm = (taskCount: number, averageTaskTime: number) => {
    const totalEstimatedTime = taskCount * averageTaskTime;
    const hoursLeft = (24 - new Date().getHours());
    
    if (totalEstimatedTime > hoursLeft * 60) {
      return {
        predicted: true,
        message: 'ALERT: Za dużo zadań na dziś. Overwhelm za 30 minut.',
        solution: 'Wybierz 3 najważniejsze. Reszta = jutro.',
        action: () => {
          // Automatycznie ukryj wszystkie zadania poza top 3
          onActionRequired('focus_top_3');
        }
      };
    }
    
    return { predicted: false };
  };

  // Interwencje wyprzedzające
  const interventions = [
    {
      trigger: 'browser_open',
      pattern: 'YouTube/Netflix/Reddit detected',
      strike: {
        title: '🚫 Wykryto Rozrywkę',
        message: 'STOP. Najpierw 1 zadanie, potem nagroda.',
        action: 'Zablokuj na 25 minut',
        type: 'blocker'
      }
    },
    {
      trigger: 'long_pause',
      pattern: 'No activity for 5 minutes',
      strike: {
        title: '⏸️ Pauza = Śmierć Momentum',
        message: 'Za długa przerwa. Wracaj TERAZ albo zaczniesz od zera.',
        action: 'Mini zadanie 2 min',
        type: 'momentum_save'
      }
    },
    {
      trigger: 'task_switching',
      pattern: 'Switched tasks 3+ times',
      strike: {
        title: '🔄 Chaos Wykryty',
        message: 'Skakanie = 0 postępu. FOCUS na 1 zadaniu.',
        action: 'Zablokuj inne zadania na 20 min',
        type: 'focus_lock'
      }
    }
  ];

  return (
    <>
      {activeStrikes.map((strike) => (
        <motion.div
          key={strike.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 max-w-sm sm:max-w-sm"
        >
          <Card className={`p-4 shadow-2xl border-2 ${
            strike.urgency === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
            strike.urgency === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
            'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-white dark:bg-gray-800">
                {strike.type === 'morning' ? <Zap className="h-5 w-5 text-yellow-500" /> :
                 strike.type === 'energy-dip' ? <Brain className="h-5 w-5 text-orange-500" /> :
                 strike.type === 'end-day' ? <Target className="h-5 w-5 text-purple-500" /> :
                 <Shield className="h-5 w-5 text-blue-500" />}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">{strike.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{strike.message}</p>
                
                {strike.countdown && <CountdownBar seconds={strike.countdown} />}
                
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onActionRequired(strike.action);
                      setActiveStrikes(prev => prev.filter(s => s.id !== strike.id));
                    }}
                  >
                    {strike.action}
                  </Button>
                  
                  {strike.reward && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-center">
                      🎁 {strike.reward}
                    </p>
                  )}
                  
                  {strike.consequence && (
                    <p className="text-xs text-red-600 dark:text-red-400 text-center">
                      ⚠️ {strike.consequence}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Floating Threat Level Indicator */}
      <ThreatLevelIndicator />
    </>
  );
}

function ThreatLevelIndicator() {
  const [threatLevel, setThreatLevel] = useState(0);

  useEffect(() => {
    const calculateThreatLevel = () => {
      const hour = new Date().getHours();
      const day = new Date().getDay();
      const lastActivity = localStorage.getItem('last_task_completed');
      const minutesSinceActivity = lastActivity ? 
        (Date.now() - parseInt(lastActivity)) / 60000 : 120;
      
      let threat = 0;
      
      // Godziny wysokiego ryzyka
      if ([9, 10, 14, 15, 20, 21].includes(hour)) threat += 20;
      
      // Piątek po południu lub weekend
      if ((day === 5 && hour > 14) || day === 0 || day === 6) threat += 30;
      
      // Długa bezczynność
      if (minutesSinceActivity > 60) threat += 25;
      if (minutesSinceActivity > 120) threat += 25;
      
      setThreatLevel(Math.min(threat, 100));
    };

    calculateThreatLevel();
    const interval = setInterval(calculateThreatLevel, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (threatLevel < 30) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed top-20 right-4 left-4 sm:left-auto z-40 flex justify-end"
    >
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
        ${threatLevel >= 70 ? 'bg-red-500 text-white' :
          threatLevel >= 50 ? 'bg-orange-500 text-white' :
          'bg-yellow-500 text-black'}
      `}>
        <AlertTriangle className="h-4 w-4" />
        <span>Zagrożenie: {threatLevel}%</span>
      </div>
    </motion.div>
  );
}

function CountdownBar({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-2">
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: seconds, ease: 'linear' }}
          className="h-full bg-red-500"
        />
      </div>
      <p className="text-xs text-center mt-1">{timeLeft}s</p>
    </div>
  );
}