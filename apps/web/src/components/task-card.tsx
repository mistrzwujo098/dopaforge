// path: apps/web/src/components/task-card.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@dopaforge/ui';
import { Clock, GripVertical, Play, Check } from 'lucide-react';
import type { Database } from '@dopaforge/db';

type Task = Database['public']['Tables']['micro_tasks']['Row'];

interface TaskCardProps {
  task: Task;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onStart, onComplete, isDragging }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`relative overflow-hidden ${isCompleted ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="cursor-move" aria-label="Drag to reorder">
              <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.est_minutes} min</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isCompleted ? null : onStart(task.id)}
              className={`p-2 rounded-full ${
                isCompleted 
                  ? 'bg-green-100 text-green-600 cursor-default' 
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
              disabled={isCompleted}
              aria-label={isCompleted ? 'Task completed' : 'Start task'}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </motion.button>
          </div>
          {isHovered && !isCompleted && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-dopamine-gradient origin-left"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}