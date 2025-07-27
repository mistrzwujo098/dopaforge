'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dopaforge/ui';
import { ComboCounter } from '@/components/combo-counter';
import { DailyLoginRewards } from '@/components/daily-login-rewards';
import { AchievementBadges } from '@/components/achievement-badges';
import { XPLevelSystem } from '@/components/xp-level-system';
import { StreakCalendar } from '@/components/streak-calendar';
import { TaskRarityCard } from '@/components/task-rarity-card';
import { PowerUpsStore } from '@/components/power-ups-store';
import { BossPortal } from '@/components/boss-portal';
import { BossBattle } from '@/components/boss-battle';
import { SkillTreeComponent, SkillPointsIndicator } from '@/components/skill-tree';
import { FeatureTestPanel } from '@/components/feature-test-panel';
import { Card } from '@dopaforge/ui';
import { SoundSystem } from '@/lib/sound-system';
import { SmartNotificationSystem as NotificationSystem } from '@/lib/notification-system';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { LinearProgress, CircularProgress, TaskCounter } from '@/components/progress-indicators';
import { SkillTreeSystem } from '@/lib/skill-trees';

export default function DemoPage() {
  const [userLevel, setUserLevel] = useState(25);
  const [userXP, setUserXP] = useState(2500);
  const [userPoints, setUserPoints] = useState(5000);
  const [taskStreak, setTaskStreak] = useState(15);
  const [showBossBattle, setShowBossBattle] = useState(false);
  
  const { isDark, toggleTheme } = useDarkMode();
  const { showHelp } = useKeyboardShortcuts([
    {
      key: 'h',
      ctrlKey: true,
      action: () => console.log('Help'),
      description: 'Pokaż pomoc'
    }
  ]);

  // Demo tasks
  const demoTasks = [
    {
      id: '1',
      title: 'Implement new feature with complex requirements and testing',
      est_minutes: 120,
      status: 'in_progress',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Quick bug fix',
      est_minutes: 15,
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'URGENT: Critical security update needed ASAP',
      est_minutes: 60,
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      importance: 10
    }
  ];

  const completedTasks = [
    {
      id: '1',
      status: 'completed',
      completed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      status: 'completed',
      completed_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      status: 'completed',
      completed_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ];

  const handlePowerUpPurchase = async (powerUp: any) => {
    setUserPoints(prev => prev - powerUp.cost);
    await NotificationSystem.getInstance().notify({
      title: 'Zakupiono Power-up!',
      body: `Zakupiono ${powerUp.name}!`,
      tag: 'power-up-purchase'
    });
  };

  const handleBossVictory = async (rewards: any) => {
    setUserXP(prev => prev + rewards.totalXP);
    setUserPoints(prev => prev + rewards.totalPoints);
    await NotificationSystem.getInstance().notify({
      title: 'Zwycięstwo nad Bossem!',
      body: `+${rewards.totalXP} XP, +${rewards.totalPoints} punktów`,
      tag: 'boss-victory'
    });
  };

  const handleSkillUnlock = () => {
    SoundSystem.getInstance().play('levelUp');
  };

  const handleDailyReward = (reward: any) => {
    setUserPoints(prev => prev + (reward.points || 0));
    if (reward.xp) setUserXP(prev => prev + reward.xp);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">DopaForge Demo</h1>
          <p className="text-muted-foreground">Wszystkie zaimplementowane funkcje w jednym miejscu</p>
        </div>
        <div className="flex items-center gap-4">
          <SkillPointsIndicator />
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 transition-colors"
          >
            {isDark ? '🌙' : '☀️'} Tryb {isDark ? 'Ciemny' : 'Jasny'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Poziom</h3>
          <p className="text-2xl font-bold">{userLevel}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">XP</h3>
          <p className="text-2xl font-bold">{userXP}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Punkty</h3>
          <p className="text-2xl font-bold">{userPoints}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Seria</h3>
          <p className="text-2xl font-bold">{taskStreak} dni</p>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Przegląd</TabsTrigger>
          <TabsTrigger value="gamification">Gamifikacja</TabsTrigger>
          <TabsTrigger value="progress">Postęp</TabsTrigger>
          <TabsTrigger value="battles">Walki</TabsTrigger>
          <TabsTrigger value="skills">Umiejętności</TabsTrigger>
          <TabsTrigger value="tests">Testy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UX Features */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Funkcje UX</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">✨ Animacje</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform">
                      Hover Effect
                    </button>
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg ripple">
                      Ripple Effect
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">🎵 Dźwięki</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => SoundSystem.getInstance().play('click')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Click Sound
                    </button>
                    <button 
                      onClick={() => SoundSystem.getInstance().play('success')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg"
                    >
                      Success Sound
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">🔔 Powiadomienia</h3>
                  <button 
                    onClick={async () => await NotificationSystem.getInstance().notify({
                      title: 'Test Notification',
                      body: 'To jest testowe powiadomienie!',
                      tag: 'test'
                    })}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                  >
                    Show Notification
                  </button>
                </div>

                <div>
                  <h3 className="font-medium mb-2">⌨️ Skróty (Ctrl+/)</h3>
                  <p className="text-sm text-muted-foreground">Naciśnij Ctrl+/ aby zobaczyć wszystkie skróty</p>
                </div>
              </div>
            </Card>

            {/* UI Features */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Funkcje UI</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">📏 Wskaźniki Postępu</h3>
                  <LinearProgress value={65} max={100} className="mb-2" />
                  <div className="flex gap-4">
                    <CircularProgress value={75} max={100} size={60} />
                    <TaskCounter completed={15} total={20} />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">💀 Skeleton Loaders</h3>
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">🎨 Style</h3>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg shadow-sm border">Shadow Level 1</div>
                    <div className="p-3 rounded-lg shadow-md border">Shadow Level 2</div>
                    <div className="p-3 rounded-lg shadow-lg border">Shadow Level 3</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Task Rarity Demo */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Rzadkość Zadań</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoTasks.map(task => (
                <TaskRarityCard key={task.id} task={task}>
                  <div className="p-4">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.est_minutes} minut
                    </p>
                  </div>
                </TaskRarityCard>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComboCounter 
              tasks={completedTasks}
              onComboBonus={(multiplier) => console.log('Combo bonus:', multiplier)}
            />
            <DailyLoginRewards userId="demo-user" />
          </div>

          <AchievementBadges 
            userId="demo-user" 
            userStats={{
              totalTasks: 100,
              streakDays: taskStreak,
              level: Math.floor(userXP / 1000) + 1,
              bossesDefeated: 3
            }}
            onAchievementUnlocked={(achievement) => {
              console.log('Achievement unlocked:', achievement.name);
              SoundSystem.getInstance().play('achievement');
            }}
          />
          
          <XPLevelSystem 
            currentXP={userXP}
            level={userLevel}
            onLevelUp={(newLevel) => {
              setUserLevel(newLevel);
              SoundSystem.getInstance().play('levelUp');
            }}
          />

          <PowerUpsStore 
            userPoints={userPoints}
            userLevel={userLevel}
            onPurchase={handlePowerUpPurchase}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <StreakCalendar 
            userId="demo-user"
            currentStreak={taskStreak}
            longestStreak={30}
            completedDates={[
              ...Array(15).fill(null).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
              })
            ]}
          />
        </TabsContent>

        <TabsContent value="battles" className="space-y-6">
          {!showBossBattle ? (
            <div>
              <BossPortal 
                userLevel={userLevel}
                onBossSelect={() => setShowBossBattle(true)}
              />
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-2">Instrukcje Boss Battle</h3>
                <p className="text-sm text-muted-foreground">
                  Wybierz bossa z portalu powyżej, aby rozpocząć walkę. Każdy boss ma unikalne mechaniki
                  i wymaga różnych strategii. Pamiętaj o wykonywaniu zadań, aby zadawać obrażenia!
                </p>
              </Card>
            </div>
          ) : (
            <BossBattle 
              userLevel={userLevel}
              onVictory={handleBossVictory}
              onDefeat={() => setShowBossBattle(false)}
            />
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="mb-4">
            <button
              onClick={() => {
                SkillTreeSystem.addSkillPoints(500);
                window.location.reload();
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
            >
              +500 Punktów Umiejętności (Demo)
            </button>
          </div>
          <SkillTreeComponent 
            userLevel={userLevel}
            onSkillUnlock={handleSkillUnlock}
          />
        </TabsContent>

        <TabsContent value="tests">
          <FeatureTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
