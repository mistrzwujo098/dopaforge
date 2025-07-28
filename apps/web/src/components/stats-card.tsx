// path: apps/web/src/components/stats-card.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@dopaforge/ui';
import { LucideIcon } from 'lucide-react';
import { cardHover, slideUp } from '@/lib/animations';
import { useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, color = 'primary', delay = 0 }: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      {...slideUp}
      {...cardHover}
      transition={{ duration: 0.3, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
          <motion.div
            animate={isHovered ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon className="h-4 w-4 text-primary" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-lg sm:text-2xl font-bold"
            initial={{ scale: 1 }}
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {value}
          </motion.div>
        </CardContent>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1.5 }}
            className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary rounded-full"
          />
        )}
      </Card>
    </motion.div>
  );
}