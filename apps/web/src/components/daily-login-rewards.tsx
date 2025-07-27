'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Calendar, Lock, Check, Sparkles } from 'lucide-react';
import { Button, Card } from '@dopaforge/ui';
import { SoundSystem } from '@/lib/sound-system';

interface DailyReward {
  day: number;
  reward: {
    type: 'xp' | 'powerup' | 'streak_freeze' | 'bonus';
    amount: number;
    name: string;
    icon: string;
  };
  claimed: boolean;
  available: boolean;
}

const REWARDS_CYCLE: DailyReward[] = [
  { day: 1, reward: { type: 'xp', amount: 50, name: '50 XP', icon: '⭐' }, claimed: false, available: false },
  { day: 2, reward: { type: 'xp', amount: 100, name: '100 XP', icon: '⭐' }, claimed: false, available: false },
  { day: 3, reward: { type: 'powerup', amount: 1, name: '2x XP Boost', icon: '⚡' }, claimed: false, available: false },
  { day: 4, reward: { type: 'xp', amount: 200, name: '200 XP', icon: '⭐' }, claimed: false, available: false },
  { day: 5, reward: { type: 'streak_freeze', amount: 1, name: 'Streak Freeze', icon: '🧊' }, claimed: false, available: false },
  { day: 6, reward: { type: 'xp', amount: 300, name: '300 XP', icon: '⭐' }, claimed: false, available: false },
  { day: 7, reward: { type: 'bonus', amount: 500, name: 'Mega Bonus!', icon: '🎁' }, claimed: false, available: false },
];

export function DailyLoginRewards({ userId }: { userId: string }) {
  const [rewards, setRewards] = useState<DailyReward[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [claimingReward, setClaimingReward] = useState<DailyReward | null>(null);
  const soundSystem = SoundSystem.getInstance();

  useEffect(() => {
    loadRewardsState();
  }, [userId]);

  const loadRewardsState = () => {
    const savedState = localStorage.getItem(`daily_rewards_${userId}`);
    const lastLogin = localStorage.getItem(`last_login_${userId}`);
    const today = new Date().toDateString();

    if (savedState && lastLogin) {
      const state = JSON.parse(savedState);
      const lastLoginDate = new Date(lastLogin).toDateString();

      // Check if it's a new day
      if (lastLoginDate !== today) {
        const daysSinceLastLogin = Math.floor(
          (new Date().getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastLogin === 1) {
          // Consecutive login
          let nextDay = state.currentDay + 1;
          if (nextDay > 7) {
            // Completed cycle - restart
            nextDay = 1;
          }
          updateRewardsForDay(nextDay);
        } else {
          // Missed days - restart
          updateRewardsForDay(1);
          soundSystem.play('failure');
        }

        // Show modal for new day
        setShowModal(true);
      } else {
        // Same day - load existing state
        setRewards(state.rewards);
        setCurrentDay(state.currentDay);
      }
    } else {
      // First time
      updateRewardsForDay(1);
      setShowModal(true);
    }

    localStorage.setItem(`last_login_${userId}`, new Date().toISOString());
  };

  const updateRewardsForDay = (day: number) => {
    const updatedRewards = REWARDS_CYCLE.map((reward, index) => ({
      ...reward,
      claimed: index < day - 1,
      available: index === day - 1
    }));

    setRewards(updatedRewards);
    setCurrentDay(day);

    const state = {
      currentDay: day,
      rewards: updatedRewards
    };

    localStorage.setItem(`daily_rewards_${userId}`, JSON.stringify(state));
  };

  const claimReward = async (reward: DailyReward) => {
    if (!reward.available || reward.claimed) return;

    setClaimingReward(reward);
    soundSystem.play('coinCollect');

    // Animate claiming
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update state
    const updatedRewards = rewards.map(r => 
      r.day === reward.day ? { ...r, claimed: true } : r
    );
    setRewards(updatedRewards);

    // Save state
    const state = {
      currentDay,
      rewards: updatedRewards
    };
    localStorage.setItem(`daily_rewards_${userId}`, JSON.stringify(state));

    // Apply reward
    applyReward(reward.reward);

    setClaimingReward(null);
    soundSystem.play('achievement');

    // Close modal after claiming
    setTimeout(() => setShowModal(false), 2000);
  };

  const applyReward = (reward: DailyReward['reward']) => {
    switch (reward.type) {
      case 'xp':
        // Add XP to user profile
        // TODO: Add XP to user profile
        break;
      case 'powerup':
        // Add power-up to inventory
        // TODO: Add power-up to inventory
        break;
      case 'streak_freeze':
        // Add streak freeze
        // TODO: Add streak freeze
        break;
      case 'bonus':
        // Special bonus
        // TODO: Apply mega bonus
        break;
    }
  };

  return (
    <>
      {/* Daily Rewards Button */}
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className="relative"
      >
        <Gift className="h-5 w-5 mr-2" />
        Nagrody Dnia
        {rewards.some(r => r.available && !r.claimed) && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Rewards Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <Card className="w-[500px] p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Codzienne Nagrody</h2>
                  <p className="text-muted-foreground">
                    Loguj się codziennie aby otrzymać coraz lepsze nagrody!
                  </p>
                </div>

                {/* 7-day cycle */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {rewards.map((reward) => (
                    <motion.div
                      key={reward.day}
                      whileHover={{ scale: reward.available && !reward.claimed ? 1.05 : 1 }}
                      className="relative"
                    >
                      <div
                        className={`aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          reward.claimed
                            ? 'bg-green-50 dark:bg-green-950 border-green-500'
                            : reward.available
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 shadow-lg'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                        }`}
                        onClick={() => reward.available && !reward.claimed && claimReward(reward)}
                      >
                        {/* Day number */}
                        <div className="text-xs font-medium mb-1">
                          Dzień {reward.day}
                        </div>

                        {/* Reward icon */}
                        <div className="text-2xl mb-1">
                          {reward.reward.icon}
                        </div>

                        {/* Reward name */}
                        <div className="text-xs text-center">
                          {reward.reward.name}
                        </div>

                        {/* Status overlay */}
                        {reward.claimed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
                            <Check className="h-8 w-8 text-green-600" />
                          </div>
                        )}

                        {!reward.claimed && !reward.available && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
                            <Lock className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        {reward.available && !reward.claimed && (
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity
                            }}
                            className="absolute -top-2 -right-2"
                          >
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Current reward highlight */}
                {rewards.find(r => r.available && !r.claimed) && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg"
                  >
                    <p className="text-lg font-medium">
                      Odbierz dzisiejszą nagrodę!
                    </p>
                    <Button
                      className="mt-2"
                      onClick={() => {
                        const todayReward = rewards.find(r => r.available && !r.claimed);
                        if (todayReward) claimReward(todayReward);
                      }}
                    >
                      Odbierz Nagrodę
                    </Button>
                  </motion.div>
                )}

                {/* Streak info */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Seria logowania: {currentDay} {currentDay === 1 ? 'dzień' : 'dni'}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Claiming animation overlay */}
      <AnimatePresence>
        {claimingReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.5 }}
              className="text-8xl"
            >
              {claimingReward.reward.icon}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}