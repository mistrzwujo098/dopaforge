'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy } from 'lucide-react';
import { SoundSystem } from '@/lib/sound-system';

interface ComboCounterProps {
  tasks: Array<{ id: string; status: string; completed_at?: string }>;
  onComboBonus: (multiplier: number) => void;
}

export function ComboCounter({ tasks, onComboBonus }: ComboCounterProps) {
  const [combo, setCombo] = useState(0);
  const [lastCompletionTime, setLastCompletionTime] = useState<Date | null>(null);
  const [showFireEffect, setShowFireEffect] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const soundSystem = SoundSystem.getInstance();

  // Combo timeout (30 minutes)
  const COMBO_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    // Calculate current combo based on recent task completions
    const recentCompletions = tasks
      .filter(t => t.status === 'completed' && t.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    if (recentCompletions.length === 0) {
      setCombo(0);
      return;
    }

    let currentCombo = 1;
    let lastTime = new Date(recentCompletions[0].completed_at!);

    for (let i = 1; i < recentCompletions.length; i++) {
      const taskTime = new Date(recentCompletions[i].completed_at!);
      const timeDiff = lastTime.getTime() - taskTime.getTime();

      if (timeDiff <= COMBO_TIMEOUT) {
        currentCombo++;
        lastTime = taskTime;
      } else {
        break;
      }
    }

    setCombo(currentCombo);
    setLastCompletionTime(new Date(recentCompletions[0].completed_at!));

    // Calculate multiplier
    const multiplier = calculateMultiplier(currentCombo);
    setComboMultiplier(multiplier);
    onComboBonus(multiplier);

    // Fire effect for high combos
    if (currentCombo >= 5) {
      setShowFireEffect(true);
      soundSystem.playCombo(currentCombo);
    }
  }, [tasks, onComboBonus]);

  // Check for combo timeout
  useEffect(() => {
    if (!lastCompletionTime || combo === 0) return;

    const checkTimeout = setInterval(() => {
      const timeSinceLastCompletion = Date.now() - lastCompletionTime.getTime();
      
      if (timeSinceLastCompletion > COMBO_TIMEOUT) {
        setCombo(0);
        setComboMultiplier(1);
        setShowFireEffect(false);
        soundSystem.play('comboBreak');
        onComboBonus(1);
      }
    }, 1000);

    return () => clearInterval(checkTimeout);
  }, [lastCompletionTime, combo, onComboBonus]);

  const calculateMultiplier = (comboCount: number): number => {
    if (comboCount < 2) return 1;
    if (comboCount < 5) return 1.2;
    if (comboCount < 10) return 1.5;
    if (comboCount < 20) return 2;
    return 3; // Max multiplier
  };

  const getComboLevel = () => {
    if (combo < 2) return { label: '', color: 'text-gray-400', icon: null };
    if (combo < 5) return { label: 'Combo!', color: 'text-blue-500', icon: Zap };
    if (combo < 10) return { label: 'Super Combo!', color: 'text-orange-500', icon: Flame };
    if (combo < 20) return { label: 'Mega Combo!', color: 'text-red-500', icon: Flame };
    return { label: 'UNSTOPPABLE!', color: 'text-purple-500', icon: Trophy };
  };

  const comboLevel = getComboLevel();
  const timeLeft = lastCompletionTime 
    ? Math.max(0, COMBO_TIMEOUT - (Date.now() - lastCompletionTime.getTime()))
    : 0;
  const timeLeftMinutes = Math.floor(timeLeft / 60000);
  const timeLeftSeconds = Math.floor((timeLeft % 60000) / 1000);

  if (combo < 2) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-20 left-4 z-50"
    >
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border-2 ${
        combo >= 20 ? 'border-purple-500' :
        combo >= 10 ? 'border-red-500' :
        combo >= 5 ? 'border-orange-500' :
        'border-blue-500'
      }`}>
        {/* Combo Counter */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={combo}
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 180 }}
              className="relative"
            >
              <div className={`text-4xl font-bold ${comboLevel.color}`}>
                {combo}x
              </div>
              
              {/* Fire effect */}
              {showFireEffect && (
                <motion.div
                  className="absolute -inset-2"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  <Flame className="h-12 w-12 text-orange-500 opacity-50" />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              {comboLevel.icon && (
                <comboLevel.icon className={`h-5 w-5 ${comboLevel.color}`} />
              )}
              <span className={`font-semibold ${comboLevel.color}`}>
                {comboLevel.label}
              </span>
            </div>
            
            {/* Multiplier */}
            <div className="text-sm text-muted-foreground">
              Mnożnik: <span className="font-bold">{comboMultiplier}x</span>
            </div>

            {/* Timer */}
            <div className="text-xs text-muted-foreground mt-1">
              <span className={timeLeftMinutes < 5 ? 'text-red-500' : ''}>
                {timeLeftMinutes}:{timeLeftSeconds.toString().padStart(2, '0')}
              </span>
              {timeLeftMinutes < 5 && ' - Pośpiesz się!'}
            </div>
          </div>
        </div>

        {/* Combo progress bar */}
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              combo >= 20 ? 'bg-purple-500' :
              combo >= 10 ? 'bg-red-500' :
              combo >= 5 ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / COMBO_TIMEOUT) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        {/* Combo milestones */}
        {combo === 5 || combo === 10 || combo === 20 ? (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-2 text-center text-sm font-medium"
          >
            🎉 Osiągnięcie odblokowane!
          </motion.div>
        ) : null}
      </div>

      {/* Floating combo numbers */}
      <AnimatePresence>
        {[...Array(Math.min(combo, 5))].map((_, i) => (
          <motion.div
            key={`flame-${i}`}
            className="absolute -top-8 left-1/2"
            initial={{ y: 0, x: '-50%', opacity: 1 }}
            animate={{
              y: -100 - i * 20,
              x: `${-50 + (Math.random() - 0.5) * 50}%`,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              delay: i * 0.1
            }}
          >
            <span className="text-2xl">🔥</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}