export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'tasks' | 'streaks' | 'focus' | 'special' | 'secret';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: string;
    value: number;
  };
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  unlockedAt?: Date;
  progress?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Task Achievements
  {
    id: 'first_task',
    name: 'Pierwszy Krok',
    description: 'Ukończ swoje pierwsze zadanie',
    icon: '🎯',
    category: 'tasks',
    rarity: 'common',
    requirement: { type: 'tasks_completed', value: 1 },
    reward: { xp: 50, badge: 'starter' }
  },
  {
    id: 'task_10',
    name: 'Początkujący',
    description: 'Ukończ 10 zadań',
    icon: '✅',
    category: 'tasks',
    rarity: 'common',
    requirement: { type: 'tasks_completed', value: 10 },
    reward: { xp: 100 }
  },
  {
    id: 'task_100',
    name: 'Centurion',
    description: 'Ukończ 100 zadań',
    icon: '💯',
    category: 'tasks',
    rarity: 'rare',
    requirement: { type: 'tasks_completed', value: 100 },
    reward: { xp: 500, badge: 'centurion' }
  },
  {
    id: 'task_1000',
    name: 'Mistrz Zadań',
    description: 'Ukończ 1000 zadań',
    icon: '👑',
    category: 'tasks',
    rarity: 'epic',
    requirement: { type: 'tasks_completed', value: 1000 },
    reward: { xp: 2000, badge: 'master', title: 'Mistrz Zadań' }
  },

  // Streak Achievements
  {
    id: 'streak_7',
    name: 'Tydzień Mocy',
    description: 'Utrzymaj 7-dniową serię',
    icon: '🔥',
    category: 'streaks',
    rarity: 'common',
    requirement: { type: 'streak_days', value: 7 },
    reward: { xp: 200 }
  },
  {
    id: 'streak_30',
    name: 'Miesięczny Wojownik',
    description: 'Utrzymaj 30-dniową serię',
    icon: '⚡',
    category: 'streaks',
    rarity: 'rare',
    requirement: { type: 'streak_days', value: 30 },
    reward: { xp: 1000, badge: 'monthly_warrior' }
  },
  {
    id: 'streak_100',
    name: 'Nieugięty',
    description: 'Utrzymaj 100-dniową serię',
    icon: '💎',
    category: 'streaks',
    rarity: 'epic',
    requirement: { type: 'streak_days', value: 100 },
    reward: { xp: 5000, badge: 'unbreakable', title: 'Nieugięty' }
  },
  {
    id: 'streak_365',
    name: 'Legenda Roku',
    description: 'Utrzymaj 365-dniową serię',
    icon: '🌟',
    category: 'streaks',
    rarity: 'legendary',
    requirement: { type: 'streak_days', value: 365 },
    reward: { xp: 10000, badge: 'year_legend', title: 'Legenda Roku' }
  },

  // Focus Achievements
  {
    id: 'focus_60',
    name: 'Godzina Skupienia',
    description: 'Pracuj przez 60 minut bez przerwy',
    icon: '🧘',
    category: 'focus',
    rarity: 'common',
    requirement: { type: 'focus_minutes', value: 60 },
    reward: { xp: 150 }
  },
  {
    id: 'focus_180',
    name: 'Maraton Skupienia',
    description: 'Pracuj przez 180 minut bez przerwy',
    icon: '🏃',
    category: 'focus',
    rarity: 'rare',
    requirement: { type: 'focus_minutes', value: 180 },
    reward: { xp: 500 }
  },
  {
    id: 'focus_total_1000',
    name: 'Tysiąc Minut',
    description: 'Zgromadź 1000 minut skupienia',
    icon: '⏱️',
    category: 'focus',
    rarity: 'rare',
    requirement: { type: 'total_focus_minutes', value: 1000 },
    reward: { xp: 800 }
  },

  // Special Achievements
  {
    id: 'night_owl',
    name: 'Nocna Sowa',
    description: 'Ukończ 5 zadań między 22:00 a 4:00',
    icon: '🦉',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'night_tasks', value: 5 },
    reward: { xp: 300, badge: 'night_owl' }
  },
  {
    id: 'early_bird',
    name: 'Ranny Ptaszek',
    description: 'Ukończ 5 zadań przed 7:00',
    icon: '🐦',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'morning_tasks', value: 5 },
    reward: { xp: 300, badge: 'early_bird' }
  },
  {
    id: 'perfectionist',
    name: 'Perfekcjonista',
    description: 'Ukończ wszystkie zadania przez 7 dni z rzędu',
    icon: '✨',
    category: 'special',
    rarity: 'epic',
    requirement: { type: 'perfect_days', value: 7 },
    reward: { xp: 1500, badge: 'perfectionist' }
  },
  {
    id: 'speed_demon',
    name: 'Demon Prędkości',
    description: 'Ukończ 5 zadań w ciągu godziny',
    icon: '⚡',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'tasks_per_hour', value: 5 },
    reward: { xp: 400, badge: 'speed_demon' }
  },

  // Secret Achievements
  {
    id: 'comeback_kid',
    name: 'Powrót z Martwych',
    description: 'Wróć po 7 dniach nieaktywności',
    icon: '🔄',
    category: 'secret',
    rarity: 'rare',
    requirement: { type: 'comeback_days', value: 7 },
    reward: { xp: 500, badge: 'comeback' }
  },
  {
    id: 'task_deleter',
    name: 'Anty-Perfekcjonista',
    description: 'Usuń 10 nieukończonych zadań',
    icon: '🗑️',
    category: 'secret',
    rarity: 'common',
    requirement: { type: 'tasks_deleted', value: 10 },
    reward: { xp: 100 }
  },
  {
    id: 'procrastinator',
    name: 'Mistrz Prokrastynacji',
    description: 'Odłóż to samo zadanie 5 razy',
    icon: '😅',
    category: 'secret',
    rarity: 'common',
    requirement: { type: 'task_postponed', value: 5 },
    reward: { xp: 50, badge: 'procrastinator' }
  }
];

export class AchievementSystem {
  static checkAchievements(stats: any): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      const isUnlocked = this.checkRequirement(achievement.requirement, stats);
      if (isUnlocked && !stats.unlockedAchievements?.includes(achievement.id)) {
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
      }
    });

    return unlockedAchievements;
  }

  static checkRequirement(requirement: Achievement['requirement'], stats: any): boolean {
    switch (requirement.type) {
      case 'tasks_completed':
        return stats.totalTasksCompleted >= requirement.value;
      case 'streak_days':
        return stats.currentStreak >= requirement.value;
      case 'focus_minutes':
        return stats.longestFocusSession >= requirement.value;
      case 'total_focus_minutes':
        return stats.totalFocusMinutes >= requirement.value;
      case 'night_tasks':
        return stats.nightTasksCompleted >= requirement.value;
      case 'morning_tasks':
        return stats.morningTasksCompleted >= requirement.value;
      case 'perfect_days':
        return stats.perfectDaysStreak >= requirement.value;
      case 'tasks_per_hour':
        return stats.maxTasksPerHour >= requirement.value;
      case 'comeback_days':
        return stats.daysInactive >= requirement.value;
      case 'tasks_deleted':
        return stats.tasksDeleted >= requirement.value;
      case 'task_postponed':
        return stats.timesPostponed >= requirement.value;
      default:
        return false;
    }
  }

  static getProgress(achievement: Achievement, stats: any): number {
    const current = this.getCurrentValue(achievement.requirement.type, stats);
    return Math.min((current / achievement.requirement.value) * 100, 100);
  }

  static getCurrentValue(type: string, stats: any): number {
    switch (type) {
      case 'tasks_completed':
        return stats.totalTasksCompleted || 0;
      case 'streak_days':
        return stats.currentStreak || 0;
      case 'focus_minutes':
        return stats.longestFocusSession || 0;
      case 'total_focus_minutes':
        return stats.totalFocusMinutes || 0;
      case 'night_tasks':
        return stats.nightTasksCompleted || 0;
      case 'morning_tasks':
        return stats.morningTasksCompleted || 0;
      case 'perfect_days':
        return stats.perfectDaysStreak || 0;
      case 'tasks_per_hour':
        return stats.maxTasksPerHour || 0;
      case 'comeback_days':
        return stats.daysInactive || 0;
      case 'tasks_deleted':
        return stats.tasksDeleted || 0;
      case 'task_postponed':
        return stats.timesPostponed || 0;
      default:
        return 0;
    }
  }

  static getRarityColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common':
        return 'text-gray-500';
      case 'rare':
        return 'text-blue-500';
      case 'epic':
        return 'text-purple-500';
      case 'legendary':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  }

  static getRarityBgColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'rare':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'epic':
        return 'bg-purple-100 dark:bg-purple-900';
      case 'legendary':
        return 'bg-yellow-100 dark:bg-yellow-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  }
}