'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Trophy, Zap } from 'lucide-react';
import { successAnimation, confettiBurst, xpGain, levelUp } from '@/lib/animations';
import useSound from 'use-sound';

interface TaskCompleteCelebrationProps {
  show: boolean;
  xpEarned: number;
  leveledUp?: boolean;
  newLevel?: number;
  onComplete?: () => void;
}

export function TaskCompleteCelebration({
  show,
  xpEarned,
  leveledUp = false,
  newLevel,
  onComplete
}: TaskCompleteCelebrationProps) {
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.7 });
  const [playLevelUp] = useSound('/sounds/levelup.mp3', { volume: 0.8 });
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (show) {
      playSuccess();
      const timers: NodeJS.Timeout[] = [];
      
      // Step 1: Show completion checkmark
      timers.push(setTimeout(() => setCurrentStep(1), 100));
      
      // Step 2: Show XP gain
      timers.push(setTimeout(() => setCurrentStep(2), 800));
      
      // Step 3: Show level up if applicable
      if (leveledUp) {
        timers.push(setTimeout(() => {
          setCurrentStep(3);
          playLevelUp();
        }, 1600));
      }
      
      // Complete animation
      timers.push(setTimeout(() => {
        setCurrentStep(0);
        onComplete?.();
      }, leveledUp ? 3000 : 2400));
      
      return () => timers.forEach(clearTimeout);
    }
  }, [show, leveledUp, playSuccess, playLevelUp, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />
          
          <div className="relative">
            {/* Step 1: Completion Checkmark */}
            <AnimatePresence>
              {currentStep >= 1 && (
                <motion.div
                  {...successAnimation}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-green-500 rounded-full p-8 mb-4"
                  >
                    <CheckCircle className="h-16 w-16 text-white" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-2"
                  >
                    Zadanie ukończone!
                  </motion.h2>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Step 2: XP Gain */}
            <AnimatePresence>
              {currentStep >= 2 && (
                <motion.div
                  {...xpGain}
                  className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2"
                >
                  <Zap className="h-8 w-8 text-yellow-400" />
                  <span className="text-4xl font-bold text-yellow-400">
                    +{xpEarned} XP
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Step 3: Level Up */}
            <AnimatePresence>
              {currentStep >= 3 && leveledUp && (
                <motion.div
                  {...levelUp}
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center"
                >
                  <Trophy className="h-12 w-12 text-yellow-500 mb-2" />
                  <span className="text-2xl font-bold text-yellow-500">
                    Poziom {newLevel}!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Sparkle effects */}
            {currentStep >= 1 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ 
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}