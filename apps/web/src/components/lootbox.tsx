// path: apps/web/src/components/lootbox.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@dopaforge/ui';
import { Gift, Sparkles, Trophy, Zap, Star, Heart, Gem, Crown } from 'lucide-react';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

interface LootboxProps {
  onOpen: () => Promise<{ type: string; payload: any }>;
  cooldownHours?: number;
  lastOpenedAt?: Date | null;
}

const REWARD_ICONS = {
  xp: Zap,
  badge: Trophy,
  theme: Sparkles,
  streak_shield: Star,
  bonus_time: Heart,
  mystery: Gem,
};

const REWARD_COLORS = {
  xp: 'text-yellow-500',
  badge: 'text-purple-500',
  theme: 'text-blue-500',
  streak_shield: 'text-green-500',
  bonus_time: 'text-red-500',
  mystery: 'text-pink-500',
};

export function Lootbox({ onOpen, cooldownHours = 24, lastOpenedAt }: LootboxProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<{ type: string; payload: any } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  const [playSpinSound] = useSound('/sounds/spin.mp3', { volume: 0.5 });
  const [playRewardSound] = useSound('/sounds/reward.mp3', { volume: 0.7 });

  const isAvailable = !lastOpenedAt || 
    (new Date().getTime() - new Date(lastOpenedAt).getTime()) >= cooldownHours * 60 * 60 * 1000;

  const handleSpin = async () => {
    if (!isAvailable || isSpinning) return;

    setIsSpinning(true);
    setReward(null);
    playSpinSound();

    // Simulate spinning animation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const result = await onOpen();
      setReward(result);
      setShowConfetti(true);
      playRewardSound();
      
      setTimeout(() => setShowConfetti(false), 5000);
    } finally {
      setIsSpinning(false);
    }
  };

  const getTimeRemaining = () => {
    if (!lastOpenedAt) return null;
    
    const hoursElapsed = (new Date().getTime() - new Date(lastOpenedAt).getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, cooldownHours - hoursElapsed);
    
    if (hoursRemaining > 1) {
      return `${Math.floor(hoursRemaining)}h ${Math.round((hoursRemaining % 1) * 60)}m`;
    } else {
      return `${Math.round(hoursRemaining * 60)}m`;
    }
  };

  const RewardIcon = reward ? REWARD_ICONS[reward.type as keyof typeof REWARD_ICONS] || Gift : Gift;
  const rewardColor = reward ? REWARD_COLORS[reward.type as keyof typeof REWARD_COLORS] || 'text-gray-500' : '';

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width || window.innerWidth}
          height={windowSize.height || window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          colors={['#fbbf24', '#a855f7', '#3b82f6', '#10b981', '#ef4444', '#ec4899']}
        />
      )}
      
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Codzienna Skrzynka
            <Crown className="h-5 w-5 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="relative w-48 h-48">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"
              animate={{
                scale: isSpinning ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: isSpinning ? Infinity : 0,
              }}
            />
            
            <motion.div
              className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl"
              animate={{
                rotate: isSpinning ? 360 : 0,
              }}
              transition={{
                duration: isSpinning ? 0.5 : 0,
                repeat: isSpinning ? Infinity : 0,
                ease: 'linear',
              }}
            >
              <AnimatePresence mode="wait">
                {!isSpinning && reward ? (
                  <motion.div
                    key="reward"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                  >
                    <RewardIcon className={`h-20 w-20 ${rewardColor}`} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="gift"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Gift className="h-20 w-20 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {reward && !isSpinning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-lg font-semibold mb-1">Wygrałeś!</p>
              <p className="text-2xl font-bold text-primary">
                {reward.type === 'xp' && `${reward.payload.amount} XP`}
                {reward.type === 'badge' && `${reward.payload.name} Badge`}
                {reward.type === 'theme' && 'Nowy Motyw Odblokowany'}
                {reward.type === 'streak_shield' && 'Ochrona Serii'}
                {reward.type === 'bonus_time' && '+15 Min Bonusu Skupienia'}
                {reward.type === 'mystery' && 'Tajemnicza Nagroda'}
              </p>
            </motion.div>
          )}

          <Button
            onClick={handleSpin}
            disabled={!isAvailable || isSpinning}
            variant="gradient"
            size="lg"
            className="min-w-[200px]"
          >
            {isSpinning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
              </motion.div>
            ) : (
              <Gift className="mr-2 h-5 w-5" />
            )}
            {isSpinning ? 'Losowanie...' : isAvailable ? 'Otwórz Skrzynkę' : `Dostępna za ${getTimeRemaining()}`}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}