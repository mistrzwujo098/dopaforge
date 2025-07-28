// path: apps/web/src/app/focus/[taskId]/page.tsx
'use client';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent } from '@dopaforge/ui';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { type Database } from '@dopaforge/db';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { updateTask, completeTask } from '@/lib/db-client';
import { Play, Pause, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';
import { DynamicConfetti } from '@/components/dynamic-imports';
import useSound from 'use-sound';
import { buttonHover, pulse, successAnimation, confettiBurst, xpGain } from '@/lib/animations';
import { t } from '@/lib/i18n';

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
          
          toast({
            title: t('focus.timerPaused'),
            description: t('focus.readyToContinue'),
            action: (
              <Button size="sm" onClick={handleResume}>
                {t('focus.resume')}
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
      const supabase = createSupabaseBrowser();
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
        title: t('common.error'),
        description: t('focus.loadError'),
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
        title: t('common.error'),
        description: t('focus.startError'),
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
      const result = await completeTask(task.id, user.id);

      toast({
        title: t('dashboard.taskCompleted'),
        description: t('dashboard.xpEarned', { xp: result.xpEarned }),
      });

      // Check for streak milestone
      if (result.newStreak % 7 === 0 && result.newStreak > 0) {
        setTimeout(() => {
          toast({
            title: t('dashboard.weeklyStreak'),
            description: t('dashboard.streakDescription', { days: result.newStreak }),
          });
        }, 2000);
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('focus.completeError'),
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
        <DynamicConfetti
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
          <motion.div
            className="absolute inset-0 bg-dopamine-gradient opacity-10"
            initial={{ clipPath: 'polygon(0 0, 0% 0, 0% 100%, 0 100%)' }}
            animate={{
              clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <CardContent className="p-12 text-center relative">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-3xl font-bold mb-8"
            >
              {task.title}
            </motion.h1>

            <div className="relative mb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="text-7xl font-mono font-bold"
                >
                  {formatTime(timeLeft)}
                </motion.div>
              </AnimatePresence>
              {isRunning && (
                <motion.div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isRunning && !isPaused && timeLeft === task.est_minutes * 60 && (
                <motion.div {...buttonHover}>
                  <Button
                    onClick={handleStart}
                    size="lg"
                    variant="gradient"
                    className="min-w-[200px]"
                  >
                    <motion.div
                      className="mr-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Play className="h-5 w-5" />
                    </motion.div>
                    {t('focus.startFocus')}
                  </Button>
                </motion.div>
              )}

              {isRunning && (
                <motion.div {...buttonHover}>
                  <Button
                    onClick={handlePause}
                    size="lg"
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    <Pause className="mr-2 h-5 w-5" />
                    {t('focus.pause')}
                  </Button>
                </motion.div>
              )}

              {isPaused && (
                <>
                  <motion.div {...buttonHover}>
                    <Button
                      onClick={handleResume}
                      size="lg"
                      variant="gradient"
                      className="min-w-[150px]"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {t('focus.resume')}
                    </Button>
                  </motion.div>
                  <motion.div {...buttonHover}>
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="outline"
                      className="min-w-[150px]"
                    >
                      <motion.div
                        className="mr-2"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <RotateCcw className="h-5 w-5" />
                      </motion.div>
                      {t('focus.reset')}
                    </Button>
                  </motion.div>
                </>
              )}

              {timeLeft === 0 && (
                <motion.div
                  {...successAnimation}
                  {...buttonHover}
                >
                  <Button
                    onClick={() => router.push('/dashboard')}
                    size="lg"
                    variant="gradient"
                    className="min-w-[200px] relative overflow-hidden"
                  >
                    <motion.div
                      className="mr-2"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </motion.div>
                    {t('focus.backToDashboard')}
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
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
              {isRunning && (
                <motion.span {...pulse}>
                  {t('focus.stayFocused')}
                </motion.span>
              )}
              {isPaused && t('focus.takeABreath')}
              {timeLeft === 0 && (
                <motion.div className="flex items-center justify-center gap-2">
                  <motion.div {...confettiBurst}>
                    <Sparkles className="h-5 w-5 text-primary" />
                  </motion.div>
                  <span>{t('focus.amazingWork')}</span>
                  <motion.div {...confettiBurst}>
                    <Sparkles className="h-5 w-5 text-primary" />
                  </motion.div>
                </motion.div>
              )}
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