// path: apps/web/src/app/focus/[taskId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent } from '@dopaforge/ui';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { updateTask, completeTask, checkAndGrantBadges, createOpenLoop, type Database } from '@dopaforge/db';
import { supabase } from '@dopaforge/db';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

type Task = Database['public']['Tables']['micro_tasks']['Row'];

export default function FocusPage({ params }: { params: { taskId: string } }) {
  const [task, setTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimeRef = useRef<number>(0);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  // Sound effects - using placeholder URLs, replace with actual sound files
  const [playStart] = useSound('/sounds/start.mp3', { volume: 0.5 });
  const [playComplete] = useSound('/sounds/complete.mp3', { volume: 0.7 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    if (user) loadTask();
  }, [user, params.taskId]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && isRunning && !isPaused) {
        pauseTimeRef.current = Date.now();
      } else if (!document.hidden && pauseTimeRef.current && isRunning && !isPaused) {
        const awayTime = Date.now() - pauseTimeRef.current;
        if (awayTime > 30000) { // Away for more than 30 seconds
          handlePause();
          
          // Create open loop (Zeigarnik effect)
          if (task && user) {
            await createOpenLoop(user.id, task.id);
          }
          
          toast({
            title: 'Timer paused - Welcome back!',
            description: 'Your task is waiting for you. Ready to continue?',
            action: (
              <Button size="sm" onClick={handleResume}>
                Resume
              </Button>
            ),
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add favicon badge when task is in progress
    if (isRunning && document.hidden) {
      const originalTitle = document.title;
      document.title = '⏸️ Task Paused - ' + originalTitle;
      
      return () => {
        document.title = originalTitle;
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
    
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused, task, user]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (isRunning) {
          handlePause();
        } else if (isPaused) {
          handleResume();
        } else {
          handleStart();
        }
      } else if (e.key === 'Escape') {
        router.push('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, isPaused]);

  const loadTask = async () => {
    try {
      const { data, error } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('id', params.taskId)
        .single();

      if (error) throw error;
      setTask(data);
      setTimeLeft(data.est_minutes * 60);
    } catch (error) {
      toast({
        title: 'Error loading task',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  };

  const handleStart = async () => {
    if (!task || !user) return;

    try {
      await updateTask(task.id, { started_at: new Date().toISOString() });
      setIsRunning(true);
      playStart();
    } catch (error) {
      toast({
        title: 'Error starting timer',
        variant: 'destructive',
      });
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (task) {
      setTimeLeft(task.est_minutes * 60);
    }
  };

  const handleComplete = async () => {
    if (!task || !user) return;

    setIsRunning(false);
    setShowConfetti(true);
    playComplete();

    try {
      await completeTask(task.id, user.id);
      const newBadges = await checkAndGrantBadges(user.id, task.est_minutes);

      toast({
        title: '🎉 Task completed!',
        description: `You earned ${task.est_minutes} XP`,
      });

      if (newBadges.length > 0) {
        setTimeout(() => {
          toast({
            title: '🏆 New badge unlocked!',
            description: `You earned the ${newBadges[0]} badge`,
          });
        }, 2000);
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error completing task',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const progress = task.est_minutes > 0 
    ? ((task.est_minutes * 60 - timeLeft) / (task.est_minutes * 60)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-dopamine-gradient opacity-10"
            style={{
              clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
            }}
          />
          <CardContent className="p-12 text-center relative">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-3xl font-bold mb-8"
            >
              {task.title}
            </motion.h1>

            <AnimatePresence mode="wait">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-7xl font-mono font-bold mb-12"
              >
                {formatTime(timeLeft)}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-4">
              {!isRunning && !isPaused && timeLeft === task.est_minutes * 60 && (
                <Button
                  onClick={handleStart}
                  size="lg"
                  variant="gradient"
                  className="min-w-[200px]"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Focus
                </Button>
              )}

              {isRunning && (
                <Button
                  onClick={handlePause}
                  size="lg"
                  variant="outline"
                  className="min-w-[200px]"
                >
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </Button>
              )}

              {isPaused && (
                <>
                  <Button
                    onClick={handleResume}
                    size="lg"
                    variant="gradient"
                    className="min-w-[150px]"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Resume
                  </Button>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="outline"
                    className="min-w-[150px]"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset
                  </Button>
                </>
              )}

              {timeLeft === 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Button
                    onClick={() => router.push('/dashboard')}
                    size="lg"
                    variant="gradient"
                    className="min-w-[200px]"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Back to Dashboard
                  </Button>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-sm text-muted-foreground"
            >
              {isRunning && 'Stay focused. You got this! 💪'}
              {isPaused && 'Take a breath. Ready when you are.'}
              {timeLeft === 0 && 'Amazing work! Task completed 🎉'}
            </motion.div>

            <div className="mt-6 text-xs text-muted-foreground text-center">
              <kbd className="px-2 py-1 rounded bg-muted">Space</kbd> to play/pause • 
              <kbd className="px-2 py-1 rounded bg-muted ml-2">Esc</kbd> to exit
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}