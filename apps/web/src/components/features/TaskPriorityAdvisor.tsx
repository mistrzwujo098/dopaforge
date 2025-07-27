'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dopaforge/ui';
import { 
  Brain,
  Zap,
  Clock,
  Target,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { getTaskPriorityAdvice } from '@/lib/ai-client';
import { useToast } from '@/hooks/useToast';

interface Task {
  id: string;
  title: string;
  est_minutes: number;
  status: string;
  deadline?: string | null;
  importance?: 'low' | 'medium' | 'high';
  energy?: 'low' | 'medium' | 'high';
}

interface TaskPriorityAdvisorProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
}

export function TaskPriorityAdvisor({ tasks, onTaskSelect }: TaskPriorityAdvisorProps) {
  const [userEnergy, setUserEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [advice, setAdvice] = useState<{
    recommendedTaskId: string;
    reasoning: string;
    alternativeTaskId?: string;
    energyTip: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Filter only pending/available tasks
  const availableTasks = tasks.filter(t => t.status === 'pending' || t.status === 'available');

  const getAdvice = async () => {
    if (availableTasks.length === 0) {
      toast({
        title: 'No tasks available',
        description: 'Complete your current tasks or add new ones to get priority advice.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const tasksForAI = availableTasks.map(t => ({
        id: t.id,
        title: t.title,
        estimatedMinutes: t.est_minutes,
        deadline: t.deadline ? new Date(t.deadline) : undefined,
        importance: t.importance || 'medium' as const,
        energy: t.energy || 'medium' as const
      }));

      const result = await getTaskPriorityAdvice(
        tasksForAI,
        new Date(),
        userEnergy
      );
      
      setAdvice(result);
    } catch (error) {
      console.error('Failed to get priority advice:', error);
      toast({
        title: 'AI Advice Failed',
        description: 'Could not generate priority advice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    if (onTaskSelect) {
      onTaskSelect(taskId);
    }
    
    const task = availableTasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: 'Great choice!',
        description: `Starting "${task.title}". You've got this! 💪`,
      });
    }
  };

  const getTaskById = (id: string) => availableTasks.find(t => t.id === id);
  const recommendedTask = advice ? getTaskById(advice.recommendedTaskId) : null;
  const alternativeTask = advice?.alternativeTaskId ? getTaskById(advice.alternativeTaskId) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Task Priority Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Energy Level Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">How's your energy right now?</label>
          <Select value={userEnergy} onValueChange={(value: any) => setUserEnergy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-red-500" />
                  Low - Need easy wins
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Medium - Ready to work
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  High - Bring it on!
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Get Advice Button */}
        {!advice && (
          <Button
            variant="gradient"
            onClick={getAdvice}
            disabled={loading || availableTasks.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing your tasks...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Priority Advice
              </>
            )}
          </Button>
        )}

        {/* Advice Display */}
        {advice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Recommended Task */}
            {recommendedTask && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-primary">RECOMMENDED</p>
                    <h4 className="font-semibold">{recommendedTask.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recommendedTask.est_minutes} min
                      </span>
                      {recommendedTask.importance && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {recommendedTask.importance}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => handleTaskSelect(recommendedTask.id)}
                  >
                    Start
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{advice.reasoning}</p>
              </div>
            )}

            {/* Alternative Task */}
            {alternativeTask && (
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">ALTERNATIVE</p>
                    <h4 className="font-medium text-sm">{alternativeTask.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alternativeTask.est_minutes} min
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTaskSelect(alternativeTask.id)}
                  >
                    Start
                  </Button>
                </div>
              </div>
            )}

            {/* Energy Tip */}
            <div className="p-3 bg-amber-500/10 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                {advice.energyTip}
              </p>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdvice(null)}
              className="w-full"
            >
              Get New Recommendation
            </Button>
          </motion.div>
        )}

        {/* No Tasks Message */}
        {availableTasks.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No pending tasks to prioritize.</p>
            <p className="text-xs mt-1">Add new tasks to get AI recommendations!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}