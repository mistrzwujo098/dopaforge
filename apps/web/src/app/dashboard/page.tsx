// path: apps/web/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@dopaforge/ui';

// Prevent static generation during build
export const dynamic = 'force-dynamic';
import { TaskCard } from '@/components/task-card';
import { CreateTaskDialog } from '@/components/create-task-dialog';
import { StatsCard } from '@/components/stats-card';
import { ProgressBar } from '@/components/progress-bar';
// Removed direct imports - using dynamic imports instead
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import {
  getTodayTasks,
  createTask,
  reorderTasks,
  getUserProfile,
  updateUserProfile,
  getTodayFutureSelf,
  createFutureSelf,
  needsWeeklyReview,
  createWeeklyReview,
  getImplementationIntentions,
  createImplementationIntention,
  deleteImplementationIntention,
  getCommitmentContracts,
  createCommitmentContract,
  updateCommitmentStatus,
  createSelfCompassionSession,
  getPrimingCues,
  createPrimingCue,
  deletePrimingCue,
  getScheduledCues,
  spinLootbox,
  updateImplementationIntention,
  updatePrimingCue,
} from '@/lib/db-client';
import {
  type Database,
} from '@dopaforge/db';
import { Trophy, Zap, Target, Calendar } from 'lucide-react';
import {
  DynamicConfetti,
  DynamicDragDropWrapper,
  DynamicDragDropContext,
  DynamicDroppable,
  DynamicDraggable,
  DynamicFutureSelfModal,
  DynamicWeeklyReviewModal,
  DynamicSelfCompassionModal,
  DynamicImplementationIntentions,
  DynamicCommitmentContract,
  DynamicEnvironmentalPriming,
  DynamicCueScheduler,
  DynamicLootbox,
  DynamicProgressStory,
  DynamicEmotionInterventions,
  DynamicTaskPriorityAdvisor,
  DynamicBehavioralInterventions,
  DynamicPreemptiveStrike,
  DynamicSocialAccountability,
  DynamicPhysicalIntegration,
  DynamicInteractiveHints,
} from '@/components/dynamic-imports';
import { NotificationPermission } from '@/components/notification-permission';
import { observability } from '@/lib/observability';
// Removed direct imports - using dynamic imports instead

type Task = Database['public']['Tables']['micro_tasks']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFutureSelf, setShowFutureSelf] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showSelfCompassion, setShowSelfCompassion] = useState(false);
  const [intentions, setIntentions] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [primingCues, setPrimingCues] = useState<any[]>([]);
  const [scheduledCues, setScheduledCues] = useState<any[]>([]);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const loadData = async () => {
    if (!user) return;

    try {
      const [tasksData, profileData, futureSelfData, needsReview, intentionsData, contractsData, primingCuesData, scheduledCuesData] = await Promise.all([
        getTodayTasks(user.id),
        getUserProfile(user.id),
        getTodayFutureSelf(user.id),
        needsWeeklyReview(user.id),
        getImplementationIntentions(user.id),
        getCommitmentContracts(user.id),
        getPrimingCues(user.id),
        getScheduledCues(user.id),
      ]);

      setTasks(tasksData);
      setProfile(profileData);
      setIntentions(intentionsData);
      setContracts(contractsData);
      setPrimingCues(primingCuesData);
      setScheduledCues(scheduledCuesData);

      // Check if user needs to do morning visualization
      const todayDate = new Date().toDateString();
      const lastVisualizationDate = localStorage.getItem('last_visualization_date');
      if (!futureSelfData && lastVisualizationDate !== todayDate) {
        setShowFutureSelf(true);
      }

      // Check if it's Sunday and user needs weekly review
      const lastReviewDate = localStorage.getItem('last_review_date');
      if (new Date().getDay() === 0 && needsReview && lastReviewDate !== todayDate) {
        setShowWeeklyReview(true);
      }
    } catch (error) {
      toast({
        title: 'Błąd ładowania danych',
        description: 'Odśwież stronę',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for user loading to complete
    if (userLoading) return;
    
    // If no user, redirect to auth
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Sprawdź czy użytkownik przeszedł onboarding
    // Najpierw sprawdź localStorage dla kompatybilności wstecznej
    const hasCompletedOnboardingLocal = localStorage.getItem('onboarding_completed');
    
    // Pobierz profil użytkownika i sprawdź status onboardingu
    try {
      const userProfile = await getUserProfile(user.id);
      if (!userProfile || !userProfile.has_completed_onboarding) {
        // Jeśli użytkownik ma localStorage ale nie ma w bazie, zaktualizuj bazę
        if (hasCompletedOnboardingLocal) {
          await updateUserProfile(user.id, {
            has_completed_onboarding: true,
            onboarding_completed_at: new Date().toISOString()
          });
        } else {
          // Przekieruj do onboardingu
          router.push('/onboarding');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // W przypadku błędu, sprawdź tylko localStorage
      if (!hasCompletedOnboardingLocal) {
        router.push('/onboarding');
        return;
      }
    }
    
    loadData();
  }, [user, userLoading, router]);

  // Enable real-time sync
  useRealtimeSync({
    userId: user?.id || '',
    onTasksChange: loadData,
    onProfileChange: loadData,
  });

  const handleCreateTask = async (title: string, estMinutes: number) => {
    if (!user) return;

    try {
      // Bezpośrednio wywołaj createTask zamiast przez observability wrapper
      const newTask = await createTask({
        user_id: user.id,
        title,
        est_minutes: estMinutes,
        display_order: tasks.length,
      });

      // Check if task was created successfully
      if (!newTask) {
        throw new Error('Nie udało się utworzyć zadania');
      }

      // Track metrics after successful creation
      observability.trackApiCall('create_task', async () => newTask);
      observability.trackUserAction('task_created', { estMinutes });

      // Immediately update local state
      setTasks(prevTasks => [...prevTasks, newTask]);
      setLastActivity(new Date());
      
      toast({
        title: 'Zadanie utworzone',
        description: `"${title}" dodane do Twojej listy`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Błąd tworzenia zadania',
        description: 'Sprawdź połączenie i spróbuj ponownie',
        variant: 'destructive',
      });
    }
  };

  const handleStartTask = (taskId: string) => {
    router.push(`/focus/${taskId}`);
  };

  const handleCompleteTask = async (taskId: string) => {
    // Task completion is handled in the focus page
    await loadData();
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !user) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);

    try {
      await reorderTasks(
        user.id,
        items.map((task) => task.id)
      );
    } catch (error) {
      toast({
        title: 'Błąd zmiany kolejności zadań',
        variant: 'destructive',
      });
      loadData(); // Reload original order
    }
  };

  const completedTasks = tasks.filter((t) => t && t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t && t.status === 'pending');
  const totalXP = completedTasks.reduce((sum, task) => sum + task.est_minutes, 0);

  const handleFutureSelfSubmit = async (visualization: string, feelings: string[]) => {
    if (!user) return;
    
    try {
      await createFutureSelf(user.id, visualization, feelings);
      setShowFutureSelf(false); // Close the modal after successful submission
      localStorage.setItem('last_visualization_date', new Date().toDateString()); // Save the date
      toast({
        title: 'Intencja ustalona',
        description: 'Twoja wizualizacja przyszłego ja została zapisana',
      });
    } catch (error) {
      toast({
        title: 'Błąd zapisu wizualizacji',
        variant: 'destructive',
      });
    }
  };

  const handleWeeklyReviewSubmit = async (review: {
    satisfaction: number;
    burnout: number;
    addiction: number;
    reflections: string;
  }) => {
    if (!user) return;
    
    try {
      await createWeeklyReview(user.id, {
        satisfaction_score: review.satisfaction,
        burnout_score: review.burnout,
        addiction_score: review.addiction,
        reflections: review.reflections,
      });
      
      // Adjust lootbox cooldown if addiction score is high
      if (review.addiction > 3 && profile) {
        const newCooldown = new Date();
        newCooldown.setHours(newCooldown.getHours() + 48); // 2 days instead of 1
        await updateUserProfile(user.id, {
          lootbox_available_at: newCooldown.toISOString(),
        });
      }
      
      setShowWeeklyReview(false); // Close the modal
      localStorage.setItem('last_review_date', new Date().toDateString()); // Save the date
      toast({
        title: 'Przegląd zakończony',
        description: 'Dziękujemy za Twoją opinię!',
      });
    } catch (error) {
      toast({
        title: 'Błąd zapisu przeglądu',
        variant: 'destructive',
      });
    }
  };

  const handleLootboxSpin = async (): Promise<{ type: string; payload: any; }> => {
    if (!user) throw new Error('No user');
    
    try {
      const reward = await spinLootbox(user.id);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      await loadData(); // Refresh profile for cooldown
      return reward;
    } catch (error: any) {
      if (error.message === 'Lootbox on cooldown') {
        toast({
          title: 'Lootbox niedostępny',
          description: 'Wróć jutro po swoją codzienną nagrodę!',
        });
      } else {
        toast({
          title: 'Błąd otwierania lootboxa',
          variant: 'destructive',
        });
      }
      throw error;
    }
  };

  if (loading || userLoading) {
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
  
  // If no user after loading, show nothing (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Behavioral Interventions System */}
      {user && (
        <DynamicBehavioralInterventions
          userId={user.id}
          currentTasks={tasks}
          lastActivity={lastActivity}
        />
      )}
      
      {/* AI Emotion-Based Interventions */}
      {user && (
        <DynamicEmotionInterventions
          currentTask={tasks.find(t => t && t.status === 'pending') || null}
          completionRate={tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}
          totalTasksToday={tasks.length}
          completedTasksToday={completedTasks.length}
        />
      )}
      
      {showConfetti && (
        <DynamicConfetti
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      <DynamicFutureSelfModal
        open={showFutureSelf}
        onClose={() => setShowFutureSelf(false)}
        onSubmit={handleFutureSelfSubmit}
      />

      <DynamicWeeklyReviewModal
        open={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
        onSubmit={handleWeeklyReviewSubmit}
        weekStats={{
          tasksCompleted: completedTasks.length,
          totalXP: totalXP,
          streakDays: profile?.current_streak || 0,
        }}
      />

      <DynamicSelfCompassionModal
        open={showSelfCompassion}
        onClose={() => setShowSelfCompassion(false)}
        onComplete={async () => {
          if (user) {
            await createSelfCompassionSession(user.id, 'Failed commitment contract', 300); // 5 minutes
            toast({
              title: 'Praktykowane samowspółczucie',
              description: 'Pamiętaj, porażka jest częścią rozwoju',
            });
          }
        }}
        triggerReason="To w porządku, że nie udało Ci się osiągnąć celu. Praktykujmy życzliwość wobec siebie."
      />

      <NotificationPermission />
      
      {/* Advanced Anti-Procrastination Systems */}
      <DynamicInteractiveHints />
      <DynamicPreemptiveStrike 
        userId={user?.id || ''} 
        onActionRequired={(action) => {
          // Handle action required
          // Handle different actions
        }}
      />

      <main id="main-content" className="container mx-auto px-4 py-6 sm:p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Czas na dopaminę! 🎯</h1>
          <p className="text-muted-foreground">Każde zadanie to kolejny poziom do przejścia</p>
        </motion.div>

        <div className="grid gap-4 grid-cols-2 sm:gap-6 md:grid-cols-4 mb-6 sm:mb-8">
          <StatsCard
            title="Dzisiejsze XP"
            value={totalXP}
            icon={Zap}
            delay={0.1}
          />
          <StatsCard
            title="Całkowite XP"
            value={profile?.total_xp || 0}
            icon={Trophy}
            delay={0.2}
          />
          <StatsCard
            title="Seria dni"
            value={`${profile?.current_streak || 0} dni`}
            icon={Calendar}
            delay={0.3}
          />
          <StatsCard
            title="Zadania dziś"
            value={`${completedTasks.length}/${tasks.length}`}
            icon={Target}
            delay={0.4}
          />
        </div>

        {/* AI Progress Story */}
        <div className="mb-6 sm:mb-8">
          <DynamicProgressStory tasks={tasks} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Postęp dnia</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={completedTasks.length}
              max={Math.max(tasks.length, 1)}
              label="Ukończone zadania"
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mikro-zadania na dziś</CardTitle>
                <CreateTaskDialog onCreateTask={handleCreateTask} />
              </CardHeader>
              <CardContent>
                <DynamicDragDropWrapper>
                  <DynamicDragDropContext onDragEnd={handleDragEnd}>
                    <DynamicDroppable droppableId="tasks">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        <AnimatePresence>
                          {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12 text-muted-foreground"
                            >
                              <p className="mb-4">Brak zadań. Stwórz pierwsze mikro-zadanie!</p>
                            </motion.div>
                          ) : (
                            <>
                              {pendingTasks.map((task, index) => (
                                <DynamicDraggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <TaskCard
                                        task={task}
                                        onStart={handleStartTask}
                                        onComplete={handleCompleteTask}
                                        isDragging={snapshot.isDragging}
                                      />
                                    </div>
                                  )}
                                </DynamicDraggable>
                              ))}
                              {completedTasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  onStart={handleStartTask}
                                  onComplete={handleCompleteTask}
                                />
                              ))}
                            </>
                          )}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </DynamicDroppable>
                </DynamicDragDropContext>
                </DynamicDragDropWrapper>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* AI Task Priority Advisor */}
            <DynamicTaskPriorityAdvisor
              tasks={tasks}
              onTaskSelect={(taskId) => {
                handleStartTask(taskId);
              }}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Małe zwycięstwa 🎯</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ukończone zadania</span>
                    <span className="text-2xl font-bold">{completedTasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Minuty skupienia</span>
                    <span className="text-2xl font-bold">{totalXP}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Następny kamień milowy</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar
                  value={profile?.total_xp || 0}
                  max={profile?.total_xp || 0 < 500 ? 500 : 2000}
                  label="Postęp XP"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {profile?.total_xp || 0 < 500
                    ? `${500 - (profile?.total_xp || 0)} XP do odznaki Momentum`
                    : `${2000 - (profile?.total_xp || 0)} XP do odznaki Mistrz Flow`}
                </p>
              </CardContent>
            </Card>

            <DynamicLootbox
              onOpen={handleLootboxSpin}
              lastOpenedAt={profile?.lootbox_available_at ? new Date(profile.lootbox_available_at) : null}
            />

            <DynamicImplementationIntentions
              intentions={intentions}
              onAdd={async (intention) => {
                await createImplementationIntention(user!.id, intention);
                await loadData();
                toast({
                  title: 'Skrypt utworzony',
                  description: 'Twoja intencja implementacyjna została zapisana',
                });
              }}
              onRemove={async (id) => {
                await deleteImplementationIntention(id);
                await loadData();
              }}
              onToggle={async (id, active) => {
                await updateImplementationIntention(id, { active });
                await loadData();
              }}
            />

            <DynamicCommitmentContract
              contracts={contracts}
              onCreateContract={async (contract) => {
                await createCommitmentContract(user!.id, contract);
                await loadData();
                toast({
                  title: 'Kontrakt utworzony',
                  description: 'Twoje zobowiązanie zostało zapieczętowane',
                });
              }}
              onUpdateStatus={async (id, status) => {
                await updateCommitmentStatus(id, status);
                
                // If failed, trigger self-compassion
                if (status === 'failed') {
                  setShowSelfCompassion(true);
                } else {
                  toast({
                    title: 'Kontrakt wypełniony!',
                    description: 'Gratulacje za dotrzymanie zobowiązania',
                  });
                }
                
                await loadData();
              }}
            />

            <DynamicEnvironmentalPriming
              cues={primingCues}
              onCreateCue={async (cue) => {
                await createPrimingCue(user!.id, cue);
                await loadData();
                toast({
                  title: 'Wskażówka primingowa utworzona',
                  description: 'Twoja wskażówka środowiskowa została ustawiona',
                });
              }}
              onUpdateCue={async (id, updates) => {
                await updatePrimingCue(id, updates);
                await loadData();
              }}
              onDeleteCue={async (id) => {
                await deletePrimingCue(id);
                await loadData();
              }}
            />

            <DynamicCueScheduler
              cues={scheduledCues}
              onUpdate={loadData}
              userId={user!.id}
            />
            
            {/* Social Accountability System */}
            <DynamicSocialAccountability
              userId={user!.id}
              currentStreak={profile?.current_streak || 0}
              tasksToday={completedTasks.length}
            />
            
            {/* Physical World Integration */}
            <DynamicPhysicalIntegration
              userId={user!.id}
              onPhysicalAction={(action) => {
                // Physical action triggered
                toast({
                  title: 'Wymagana akcja fizyczna',
                  description: action,
                });
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}