'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button } from '@dopaforge/ui';
import { 
  Heart, 
  Coffee, 
  Zap, 
  Brain, 
  X,
  Sparkles,
  Activity
} from 'lucide-react';
import { getEmotionBasedIntervention } from '@/lib/ai-client';
import { useToast } from '@/hooks/useToast';

interface Task {
  id: string;
  title: string;
  started_at?: string | null;
  status?: string;
}

interface EmotionInterventionsProps {
  currentTask?: Task | null;
  completionRate: number;
  totalTasksToday: number;
  completedTasksToday: number;
}

export function EmotionInterventions({ 
  currentTask, 
  completionRate,
  totalTasksToday,
  completedTasksToday
}: EmotionInterventionsProps) {
  const [intervention, setIntervention] = useState<{
    type: string;
    message: string;
    duration: string;
    followUp: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCheckedTaskId, setLastCheckedTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate time spent on current task
  const getTimeSpentMinutes = () => {
    if (!currentTask?.started_at) return 0;
    const started = new Date(currentTask.started_at);
    const now = new Date();
    return Math.floor((now.getTime() - started.getTime()) / (1000 * 60));
  };

  // Check if intervention is needed
  const checkForIntervention = async () => {
    if (!currentTask || currentTask.status !== 'in_progress') return;
    if (currentTask.id === lastCheckedTaskId && intervention) return; // Don't re-check same task
    
    const timeSpent = getTimeSpentMinutes();
    
    // Trigger points for interventions
    const shouldIntervene = 
      timeSpent > 45 || // Working too long on one task
      (timeSpent > 25 && completionRate < 30) || // Struggling with low completion
      (totalTasksToday > 10 && completedTasksToday < 2); // Overwhelmed
    
    if (!shouldIntervene) return;
    
    setLoading(true);
    try {
      const result = await getEmotionBasedIntervention({
        taskTitle: currentTask.title,
        timeSpentMinutes: timeSpent,
        completionRate,
        recentMood: getMoodIndicator()
      });
      
      setIntervention(result);
      setIsVisible(true);
      setLastCheckedTaskId(currentTask.id);
    } catch (error) {
      console.error('Failed to get intervention:', error);
    } finally {
      setLoading(false);
    }
  };

  // Derive mood from completion rate and time patterns
  const getMoodIndicator = () => {
    if (completionRate > 70) return 'productive';
    if (completionRate < 30 && totalTasksToday > 5) return 'overwhelmed';
    if (getTimeSpentMinutes() > 60) return 'fatigued';
    return 'neutral';
  };

  // Check for intervention every 5 minutes while working
  useEffect(() => {
    if (!currentTask || currentTask.status !== 'in_progress') return;
    
    // Check immediately
    checkForIntervention();
    
    // Then check every 5 minutes
    const interval = setInterval(() => {
      checkForIntervention();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentTask, completionRate]);

  const handleAcceptIntervention = () => {
    if (!intervention) return;
    
    toast({
      title: 'Great choice! 🌟',
      description: `Taking a ${intervention.duration} break. ${intervention.followUp}`,
    });
    
    // Set a reminder for when to come back
    const durationMinutes = parseInt(intervention.duration);
    if (durationMinutes > 0) {
      setTimeout(() => {
        toast({
          title: 'Break time is over! 💪',
          description: 'Ready to get back to work? You\'ve got this!',
        });
      }, durationMinutes * 60 * 1000);
    }
    
    setIsVisible(false);
  };

  const getInterventionIcon = () => {
    if (!intervention) return <Heart className="h-5 w-5" />;
    
    switch (intervention.type.toLowerCase()) {
      case 'break suggestion':
        return <Coffee className="h-5 w-5" />;
      case 'energy boost technique':
        return <Zap className="h-5 w-5" />;
      case 'task simplification advice':
        return <Brain className="h-5 w-5" />;
      case 'encouraging message':
        return <Heart className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getInterventionColor = () => {
    if (!intervention) return 'from-blue-500/20 to-purple-500/20';
    
    switch (intervention.type.toLowerCase()) {
      case 'break suggestion':
        return 'from-amber-500/20 to-orange-500/20';
      case 'energy boost technique':
        return 'from-green-500/20 to-emerald-500/20';
      case 'task simplification advice':
        return 'from-blue-500/20 to-indigo-500/20';
      case 'encouraging message':
        return 'from-pink-500/20 to-rose-500/20';
      default:
        return 'from-purple-500/20 to-violet-500/20';
    }
  };

  if (!isVisible || !intervention) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 right-4 z-50 max-w-sm"
      >
        <Card className="relative overflow-hidden shadow-lg">
          <div className={`absolute inset-0 bg-gradient-to-br ${getInterventionColor()}`} />
          
          <CardContent className="relative p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getInterventionIcon()}
                <h3 className="font-semibold text-sm">
                  {intervention.type}
                </h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm mb-4 leading-relaxed">
              {intervention.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Suggested duration: {intervention.duration}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsVisible(false)}
                >
                  Not now
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={handleAcceptIntervention}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Let\'s do it
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}