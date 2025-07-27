'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  color?: string;
}

export function CircularProgress({
  value,
  max,
  size = 60,
  strokeWidth = 4,
  className = '',
  showValue = true,
  color = '#3b82f6'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface LinearProgressProps {
  value: number;
  max: number;
  height?: number;
  className?: string;
  showValue?: boolean;
  color?: string;
  animated?: boolean;
}

export function LinearProgress({
  value,
  max,
  height = 8,
  className = '',
  showValue = false,
  color = '#3b82f6',
  animated = true
}: LinearProgressProps) {
  const progress = Math.min((value / max) * 100, 100);

  return (
    <div className={`relative ${className}`}>
      <div
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {animated && (
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          )}
        </motion.div>
      </div>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-white drop-shadow">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface DayProgressProps {
  tasksCompleted: number;
  totalTasks: number;
  timeElapsed: number; // in minutes
  totalTime: number; // in minutes
}

export function DayProgress({
  tasksCompleted,
  totalTasks,
  timeElapsed,
  totalTime
}: DayProgressProps) {
  const taskProgress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const timeProgress = totalTime > 0 ? (timeElapsed / totalTime) * 100 : 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Zadania</span>
          <span className="text-sm font-medium">
            {tasksCompleted} / {totalTasks}
          </span>
        </div>
        <LinearProgress
          value={tasksCompleted}
          max={totalTasks}
          color="#10b981"
          height={6}
        />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Czas</span>
          <span className="text-sm font-medium">
            {Math.floor(timeElapsed / 60)}h {timeElapsed % 60}m
          </span>
        </div>
        <LinearProgress
          value={timeElapsed}
          max={totalTime}
          color="#3b82f6"
          height={6}
        />
      </div>
    </div>
  );
}

interface RealtimeCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function RealtimeCounter({
  value,
  prefix = '',
  suffix = '',
  className = ''
}: RealtimeCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const difference = value - startValue;
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = difference / steps;
    let current = startValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span
      key={displayValue}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={className}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}

interface TaskProgressMiniProps {
  completed: number;
  total: number;
}

export function TaskProgressMini({ completed, total }: TaskProgressMiniProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {completed}/{total}
      </span>
    </div>
  );
}

interface TaskCounterProps {
  completed: number;
  total: number;
}

export function TaskCounter({ completed, total }: TaskCounterProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-3xl font-bold">
        {completed}
        <span className="text-xl text-muted-foreground">/{total}</span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        zadań ukończonych
      </div>
      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
}