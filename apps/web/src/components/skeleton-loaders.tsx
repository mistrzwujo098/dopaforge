'use client';

import { motion } from 'framer-motion';
import { shimmer } from '@/lib/animations';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'shimmer'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 relative overflow-hidden';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined)
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {animation === 'pulse' && (
        <motion.div
          className="absolute inset-0 bg-gray-300 dark:bg-gray-600"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {animation === 'shimmer' && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          {...shimmer}
        />
      )}
      {animation === 'wave' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '200%' }}
        />
      )}
    </div>
  );
}

// Task Card Skeleton
export function TaskCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" width={16} height={16} animation="pulse" />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-1" />
          <div className="flex items-center gap-1">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="text" width="30%" height={12} />
          </div>
        </div>
        <Skeleton variant="circular" width={32} height={32} animation="pulse" />
      </div>
    </motion.div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm h-full"
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="circular" width={16} height={16} animation="pulse" />
      </div>
      <Skeleton variant="text" width="40%" height={28} className="mt-2" animation="wave" />
    </motion.div>
  );
}

// List Skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <TaskCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 sm:p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-2 mb-6 sm:mb-8">
            <Skeleton variant="text" width="30%" height={32} animation="wave" />
            <Skeleton variant="text" width="50%" height={20} />
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-2 sm:gap-6 md:grid-cols-4 mb-6 sm:mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <StatsCardSkeleton />
              </motion.div>
            ))}
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8"
          >
            <Skeleton variant="text" width="20%" className="mb-4" />
            <Skeleton variant="rounded" height={12} animation="shimmer" />
          </motion.div>

          {/* Task List */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 order-2 lg:order-1"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="rounded" width={140} height={40} animation="pulse" />
                </div>
                <ListSkeleton count={3} />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="order-1 lg:order-2"
            >
              <StatsCardSkeleton />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b dark:border-gray-700">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton variant="text" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b dark:border-gray-700">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <Skeleton variant="text" width="90%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Content Skeleton with realistic layout
export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" width="40%" height={24} />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
      <Skeleton variant="rounded" width="100%" height={200} className="my-4" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="85%" />
      </div>
    </div>
  );
}