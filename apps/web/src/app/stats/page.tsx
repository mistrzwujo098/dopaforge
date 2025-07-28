'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dopaforge/ui';
import { 
  BarChart3, 
  Trophy, 
  Zap, 
  Target, 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { getUserProfile, getTaskStats } from '@/lib/db-client';
import { t } from '@/lib/i18n';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  averageTaskDuration: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  completionRate: number;
  weeklyProgress: { day: string; tasks: number; minutes: number }[];
  topTaskHours: { hour: number; count: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [profile, taskStats] = await Promise.all([
        getUserProfile(user.id),
        getTaskStats(user.id)
      ]);

      if (profile && taskStats) {
        const level = Math.floor((profile.total_xp || 0) / 100) + 1;
        
        // Mock weekly progress data (in production, this would come from DB)
        const weekDays = [t('common.monday'), t('common.tuesday'), t('common.wednesday'), t('common.thursday'), t('common.friday'), t('common.saturday'), t('common.sunday')];
        const today = new Date();
        const weeklyProgress = weekDays.map((day, index) => {
          const daysAgo = (today.getDay() + 6 - index) % 7;
          return {
            day,
            tasks: Math.floor(Math.random() * 8) + 1,
            minutes: Math.floor(Math.random() * 120) + 30
          };
        });

        // Mock top task hours (in production, analyze task completion times)
        const topTaskHours = [
          { hour: 9, count: 12 },
          { hour: 10, count: 18 },
          { hour: 11, count: 15 },
          { hour: 14, count: 20 },
          { hour: 15, count: 16 },
          { hour: 16, count: 10 }
        ];

        setStats({
          totalTasks: taskStats.totalTasks,
          completedTasks: taskStats.completedTasks,
          totalMinutes: taskStats.totalMinutes,
          averageTaskDuration: taskStats.totalTasks > 0 ? Math.round(taskStats.totalMinutes / taskStats.totalTasks) : 0,
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          totalXP: profile.total_xp || 0,
          level,
          completionRate: taskStats.totalTasks > 0 ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100) : 0,
          weeklyProgress,
          topTaskHours
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('stats.noData')}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: t('stats.totalXP'),
      value: stats.totalXP,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      description: t('stats.level', { level: stats.level })
    },
    {
      title: t('stats.completedTasks'),
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      description: t('stats.completionRate', { rate: stats.completionRate })
    },
    {
      title: t('stats.focusTime'),
      value: `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      description: t('stats.avgTaskDuration', { minutes: stats.averageTaskDuration })
    },
    {
      title: t('stats.currentStreak'),
      value: stats.currentStreak,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      description: t('stats.longestStreak', { days: stats.longestStreak })
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <main id="main-content" className="container mx-auto px-4 py-6 sm:p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('stats.title')}</h1>
          <p className="text-muted-foreground">{t('stats.subtitle')}</p>
        </motion.div>

        {/* Key Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bgColor}`} 
                  style={{ 
                    background: `linear-gradient(to right, ${stat.color} 0%, ${stat.color} ${stats.completionRate}%, transparent ${stats.completionRate}%)` 
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('stats.weeklyActivity')}
              </CardTitle>
              <CardDescription>
                {t('stats.dailyProductivity')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {stats.weeklyProgress.map((day, index) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.minutes / 120) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-emerald-500 to-cyan-500 rounded-t-lg relative group cursor-pointer"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.tasks} {t('stats.tasksCount')} • {day.minutes} {t('common.minutes')}
                      </div>
                    </motion.div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Productivity Insights */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('stats.topWorkingHours')}
                </CardTitle>
                <CardDescription>
                  {t('stats.whenMostProductive')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topTaskHours.map((hour, index) => (
                    <div key={hour.hour} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-12">{hour.hour}:00</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(hour.count / 20) * 100}%` }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-end pr-2"
                        >
                          <span className="text-xs text-white font-medium">
                            {hour.count}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {t('stats.achievements')}
                </CardTitle>
                <CardDescription>
                  {t('stats.milestones')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('stats.beginner')}</p>
                      <p className="text-sm text-muted-foreground">{t('stats.beginnerDesc')}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('stats.focused')}</p>
                      <p className="text-sm text-muted-foreground">{t('stats.focusedDesc')}</p>
                    </div>
                    {stats.totalMinutes >= 100 ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {t('stats.minutesToUnlock', { count: 100 - stats.totalMinutes })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('stats.systematic')}</p>
                      <p className="text-sm text-muted-foreground">{t('stats.systematicDesc')}</p>
                    </div>
                    {stats.currentStreak >= 7 ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {t('stats.daysToUnlock', { count: 7 - stats.currentStreak })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}