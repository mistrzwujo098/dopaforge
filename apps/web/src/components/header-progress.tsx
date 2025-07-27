'use client';

import { motion } from 'framer-motion';
import { Zap, Trophy, Flame, Target } from 'lucide-react';
import { LinearProgress, CircularProgress } from './progress-indicators';

interface HeaderProgressProps {
  dailyXP: number;
  dailyXPGoal: number;
  streak: number;
  tasksCompleted: number;
  totalTasks: number;
  level: number;
  levelProgress: number;
}

export function HeaderProgress({
  dailyXP,
  dailyXPGoal,
  streak,
  tasksCompleted,
  totalTasks,
  level,
  levelProgress
}: HeaderProgressProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Daily Progress */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div className="w-32">
                <LinearProgress
                  value={dailyXP}
                  max={dailyXPGoal}
                  height={4}
                  color="#eab308"
                />
              </div>
              <span className="text-xs font-medium">
                {dailyXP}/{dailyXPGoal} XP
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2">
              <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">
                {streak} dni
              </span>
            </div>

            {/* Tasks */}
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div className="w-20">
                <LinearProgress
                  value={tasksCompleted}
                  max={totalTasks}
                  height={4}
                  color="#10b981"
                />
              </div>
              <span className="text-xs font-medium">
                {tasksCompleted}/{totalTasks}
              </span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Poziom</p>
              <p className="text-lg font-bold">{level}</p>
            </div>
            <CircularProgress
              value={levelProgress}
              max={100}
              size={40}
              strokeWidth={3}
              color="#8b5cf6"
            />
          </div>
        </div>
      </div>

      {/* Progress line at the very top */}
      <motion.div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        initial={{ width: 0 }}
        animate={{ width: `${(tasksCompleted / totalTasks) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}