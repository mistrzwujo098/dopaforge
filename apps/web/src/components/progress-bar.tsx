// path: apps/web/src/components/progress-bar.tsx
'use client';

import { motion } from 'framer-motion';
import { Progress } from '@dopaforge/ui';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isHighProgress = percentage >= 80;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <motion.span
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-medium ${isHighProgress ? 'text-primary' : ''}`}
          >
            {value} / {max}
          </motion.span>
        </div>
      )}
      <div className="relative">
        <Progress value={value} max={max} className="h-3" />
        {isHighProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 h-3 rounded-full bg-dopamine-gradient opacity-20 blur-xl"
          />
        )}
      </div>
    </div>
  );
}