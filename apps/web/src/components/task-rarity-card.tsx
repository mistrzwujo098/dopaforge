'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Zap } from 'lucide-react';
import { TaskRarity, RARITY_CONFIG, TaskRaritySystem } from '@/lib/task-rarity';
import { cn } from '@/lib/utils';

interface TaskRarityCardProps {
  task: {
    id: string;
    title: string;
    est_minutes: number;
    status: string;
    created_at: string;
  };
  children: React.ReactNode;
  onRarityCalculated?: (rarity: TaskRarity) => void;
}

export function TaskRarityCard({ task, children, onRarityCalculated }: TaskRarityCardProps) {
  const [rarity, setRarity] = useState<TaskRarity>('common');
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const calculatedRarity = TaskRaritySystem.calculateRarity(task);
    setRarity(calculatedRarity);
    
    if (onRarityCalculated) {
      onRarityCalculated(calculatedRarity);
    }

    // Show particles for epic and legendary
    if (calculatedRarity === 'epic' || calculatedRarity === 'legendary') {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 5000);
    }
  }, [task, onRarityCalculated]);

  const config = RARITY_CONFIG[rarity];
  const effects = TaskRaritySystem.getSpecialEffects(rarity);

  return (
    <motion.div
      className={cn(
        'relative rounded-lg overflow-hidden transition-all',
        config.bgColor,
        'border-2',
        config.borderColor,
        effects.glow && 'shadow-lg'
      )}
      whileHover={rarity !== 'common' ? { scale: 1.02 } : {}}
      style={{
        boxShadow: effects.glow 
          ? `0 0 20px ${config.glowColor}` 
          : undefined
      }}
    >
      {/* Rarity indicator */}
      <div className="absolute top-2 right-2 z-10">
        <motion.div
          animate={effects.animation === 'pulse' ? {
            scale: [1, 1.2, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            config.bgColor,
            config.color,
            'border',
            config.borderColor
          )}
        >
          <span>{config.icon}</span>
          <span className="capitalize">{rarity}</span>
        </motion.div>
      </div>

      {/* Shimmer effect for epic/legendary */}
      {(rarity === 'epic' || rarity === 'legendary') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      )}

      {/* Rainbow effect for legendary */}
      {rarity === 'legendary' && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 animate-pulse" />
        </div>
      )}

      {/* Particles */}
      {showParticles && effects.particles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: Math.random() * 100 + '%',
                y: '100%',
                scale: 0
              }}
              animate={{
                y: '-20%',
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 5
              }}
            >
              {rarity === 'legendary' ? (
                <Star className="h-4 w-4" style={{ color: config.particleColor }} />
              ) : (
                <Sparkles className="h-4 w-4" style={{ color: config.particleColor }} />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* XP Multiplier badge */}
      {rarity !== 'common' && (
        <div className="absolute bottom-2 right-2 z-10">
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs font-bold',
            config.bgColor,
            config.color
          )}>
            <Zap className="h-3 w-3" />
            <span>{config.xpMultiplier}x XP</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-5">
        {children}
      </div>
    </motion.div>
  );
}

// Loot drop animation component
export function LootDropAnimation({ 
  rarity, 
  loot 
}: { 
  rarity: TaskRarity; 
  loot: ReturnType<typeof TaskRaritySystem.generateLoot> 
}) {
  const config = RARITY_CONFIG[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
    >
      <div className={cn(
        'p-4 rounded-lg shadow-2xl',
        config.bgColor,
        'border-2',
        config.borderColor
      )}>
        <h3 className={cn('font-bold text-center mb-2', config.color)}>
          Loot Drop!
        </h3>
        
        {/* XP Bonus */}
        {loot.xpBonus > 0 && (
          <div className="text-center mb-2">
            <span className="text-2xl font-bold">+{loot.xpBonus} XP</span>
          </div>
        )}

        {/* Items */}
        <div className="space-y-1">
          {loot.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-sm"
            >
              • {item}
            </motion.div>
          ))}
        </div>

        {/* Special Reward */}
        {loot.specialReward && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-center"
          >
            <Star className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
            <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
              {loot.specialReward}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}