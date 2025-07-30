'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@dopaforge/ui';
import { Sparkles, Calendar, Clock, Trophy } from 'lucide-react';
import { generateProgressStory } from '@/lib/ai-client';

interface Task {
  id: string;
  title: string;
  est_minutes: number;
  completed_at?: string | null;
  status?: string;
}

interface ProgressStoryProps {
  tasks?: Task[];
}

export function ProgressStory({ tasks = [] }: ProgressStoryProps) {
  const [story, setStory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');
  const [isVisible, setIsVisible] = useState(false);

  // Get completed tasks for the selected period
  const getCompletedTasks = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    const cutoffDate = period === 'daily' ? startOfDay : startOfWeek;
    
    return tasks
      .filter(task => {
        const isCompleted = task.status === 'completed' || task.completed_at;
        if (!isCompleted) return false;
        
        if (task.completed_at) {
          return new Date(task.completed_at) >= cutoffDate;
        }
        // If no completed_at date but marked as completed, assume it was today
        return true;
      })
      .map(task => ({
        title: task.title,
        completedAt: task.completed_at ? new Date(task.completed_at) : new Date(),
        estimatedMinutes: task.est_minutes
      }));
  };

  const generateStory = async () => {
    const completedTasks = getCompletedTasks();
    
    if (completedTasks.length === 0) {
      setStory(period === 'daily' 
        ? "Your adventure awaits! Complete your first task today to unlock your heroic story."
        : "This week is full of potential! Complete some tasks to see your epic journey unfold."
      );
      return;
    }

    setLoading(true);
    try {
      const generatedStory = await generateProgressStory(completedTasks, period);
      setStory(generatedStory);
      setIsVisible(true);
    } catch (error: any) {
      console.error('Failed to generate story:', error);
      // Check if it's an API key error
      if (error.message?.includes('API key') || error.message?.includes('GEMINI_API_KEY')) {
        setStory(
          `⚠️ Funkcja AI wymaga klucza API Gemini. Dodaj GEMINI_API_KEY do pliku .env.local\n\nW międzyczasie: ${period === 'daily' ? 'Dzisiaj' : 'W tym tygodniu'} ukończyłeś ${completedTasks.length} zadań i zainwestowałeś ${totalMinutes} minut w swój rozwój. Każde ukończone zadanie to krok do Twoich celów!`
        );
      } else {
        // Fallback story
        const totalTime = completedTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
        setStory(
          `🎉 Niesamowity ${period === 'daily' ? 'dzień' : 'tydzień'}! Ukończyłeś ${completedTasks.length} zadań i zainwestowałeś ${totalTime} minut w swój rozwój. Każde ukończone zadanie to kamień milowy do Twoich celów!`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate story when component mounts if tasks exist
    const completedTasks = getCompletedTasks();
    if (completedTasks.length > 0) {
      generateStory();
    }
  }, []);

  const completedCount = getCompletedTasks().length;
  const totalMinutes = getCompletedTasks().reduce((sum, task) => sum + task.estimatedMinutes, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Epic Journey
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={period === 'daily' ? 'default' : 'outline'}
              onClick={() => {
                setPeriod('daily');
                setIsVisible(false);
              }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Daily
            </Button>
            <Button
              size="sm"
              variant={period === 'weekly' ? 'default' : 'outline'}
              onClick={() => {
                setPeriod('weekly');
                setIsVisible(false);
              }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Weekly
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg backdrop-blur">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg backdrop-blur">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes Invested</p>
            </div>
          </div>
        </div>

        {/* Story */}
        <AnimatePresence mode="wait">
          {!isVisible ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-4"
            >
              <Button
                variant="gradient"
                onClick={generateStory}
                disabled={loading}
                className="mx-auto"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Crafting Your Story...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate My Story
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {story}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => generateStory()}
                className="mt-2"
                disabled={loading}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}