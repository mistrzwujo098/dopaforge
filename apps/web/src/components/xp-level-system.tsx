'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Star, ChevronUp } from 'lucide-react';
import { SoundSystem } from '@/lib/sound-system';

interface XPLevelSystemProps {
  currentXP: number;
  level: number;
  onLevelUp?: (newLevel: number) => void;
}

// XP required for each level (exponential growth)
const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

export function XPLevelSystem({ currentXP, level, onLevelUp }: XPLevelSystemProps) {
  const [displayXP, setDisplayXP] = useState(currentXP);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpRewards, setLevelUpRewards] = useState<any>(null);
  const soundSystem = SoundSystem.getInstance();

  const currentLevelXP = getTotalXPForLevel(displayLevel);
  const nextLevelXP = getTotalXPForLevel(displayLevel + 1);
  const xpInCurrentLevel = displayXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  useEffect(() => {
    // Animate XP gain
    const startXP = displayXP;
    const endXP = currentXP;
    const difference = endXP - startXP;

    if (difference > 0) {
      const duration = Math.min(difference * 10, 2000); // Max 2 seconds
      const steps = 60;
      const increment = difference / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newXP = Math.floor(startXP + increment * currentStep);
        setDisplayXP(newXP);

        // Check for level up
        const newLevel = calculateLevel(newXP);
        if (newLevel > displayLevel) {
          triggerLevelUp(newLevel);
        }

        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayXP(endXP);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [currentXP]);

  const calculateLevel = (xp: number): number => {
    let calcLevel = 1;
    let totalNeeded = 0;

    while (totalNeeded <= xp) {
      totalNeeded += getXPForLevel(calcLevel);
      if (totalNeeded > xp) break;
      calcLevel++;
    }

    return calcLevel;
  };

  const triggerLevelUp = (newLevel: number) => {
    setIsLevelingUp(true);
    setDisplayLevel(newLevel);
    soundSystem.playLevelUp();

    // Calculate rewards
    const rewards = {
      level: newLevel,
      unlockedFeatures: getUnlockedFeatures(newLevel),
      bonusXP: newLevel * 50,
      newTitle: getLevelTitle(newLevel)
    };

    setLevelUpRewards(rewards);
    setShowLevelUpModal(true);

    if (onLevelUp) {
      onLevelUp(newLevel);
    }

    setTimeout(() => setIsLevelingUp(false), 3000);
  };

  const getUnlockedFeatures = (level: number): string[] => {
    const features: Record<number, string[]> = {
      5: ['Power-up: 2x XP Boost'],
      10: ['Nowy tytuł: Adept', 'Dostęp do sklepu mocy'],
      15: ['Power-up: Time Freeze'],
      20: ['Nowy tytuł: Expert', 'Odblokowane Boss Battles'],
      25: ['Power-up: Task Skip Token'],
      30: ['Nowy tytuł: Master', 'Skill Trees dostępne'],
      40: ['Nowy tytuł: Grandmaster'],
      50: ['Nowy tytuł: Legend', 'Wszystkie funkcje odblokowane']
    };

    return features[level] || [];
  };

  const getLevelTitle = (level: number): string => {
    if (level >= 50) return 'Legend';
    if (level >= 40) return 'Grandmaster';
    if (level >= 30) return 'Master';
    if (level >= 20) return 'Expert';
    if (level >= 10) return 'Adept';
    if (level >= 5) return 'Apprentice';
    return 'Novice';
  };

  return (
    <>
      {/* XP Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-lg">Level {displayLevel}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {getLevelTitle(displayLevel)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              {xpInCurrentLevel} / {xpNeededForNextLevel} XP
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          </motion.div>

          {/* XP Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-semibold text-sm">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Next Level Preview */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Następny poziom: Level {displayLevel + 1} • 
          Potrzeba {xpNeededForNextLevel - xpInCurrentLevel} XP
        </div>
      </div>

      {/* Level Up Animation Overlay */}
      <AnimatePresence>
        {isLevelingUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none"
          >
            {/* Background flash */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute w-96 h-96 bg-yellow-500 rounded-full"
            />

            {/* Level Up Text */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring',
                damping: 10,
                stiffness: 100
              }}
              className="text-center"
            >
              <h1 className="text-6xl font-bold text-yellow-500 mb-2">
                LEVEL UP!
              </h1>
              <div className="text-4xl font-bold text-white">
                Level {displayLevel}
              </div>
            </motion.div>

            {/* Particle effects */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: 0, 
                  y: 0,
                  scale: 0
                }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05
                }}
              >
                <Star className="h-8 w-8 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Rewards Modal */}
      <AnimatePresence>
        {showLevelUpModal && levelUpRewards && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLevelUpModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                    className="inline-block"
                  >
                    <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
                  </motion.div>

                  <h2 className="text-3xl font-bold mb-2">
                    Gratulacje!
                  </h2>
                  <p className="text-xl mb-4">
                    Osiągnąłeś Level {levelUpRewards.level}
                  </p>

                  {levelUpRewards.newTitle && (
                    <div className="mb-4 p-2 bg-purple-100 dark:bg-purple-900 rounded">
                      <p className="text-sm font-medium">Nowy Tytuł</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {levelUpRewards.newTitle}
                      </p>
                    </div>
                  )}

                  {levelUpRewards.unlockedFeatures.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium mb-2">Odblokowano:</p>
                      {levelUpRewards.unlockedFeatures.map((feature: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 justify-center mb-1"
                        >
                          <ChevronUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      onClick={() => setShowLevelUpModal(false)}
                      className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Świetnie!
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}