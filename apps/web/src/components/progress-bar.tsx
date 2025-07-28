// path: apps/web/src/components/progress-bar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@dopaforge/ui';
import { shimmer, pulse, xpGain } from '@/lib/animations';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isHighProgress = percentage >= 80;
  const [prevValue, setPrevValue] = useState(value);
  const [showXPGain, setShowXPGain] = useState(false);

  useEffect(() => {
    if (value > prevValue) {
      setShowXPGain(true);
      const timer = setTimeout(() => setShowXPGain(false), 1500);
      return () => clearTimeout(timer);
    }
    setPrevValue(value);
  }, [value, prevValue]);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <div className="relative">
            <motion.span
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-medium ${isHighProgress ? 'text-primary' : ''}`}
            >
              {value} / {max}
            </motion.span>
            <AnimatePresence>
              {showXPGain && (
                <motion.div
                  {...xpGain}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-primary"
                >
                  +1 XP
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      <div className="relative">
        <Progress 
          value={value} 
          max={max} 
          className="h-3 overflow-hidden" 
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
        <motion.div
          className="absolute inset-0 h-3 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          {...shimmer}
        />
        {isHighProgress && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 h-3 rounded-full bg-dopamine-gradient opacity-20 blur-xl"
              {...pulse}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -right-1 top-1/2 -translate-y-1/2"
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}