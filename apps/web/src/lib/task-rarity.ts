export type TaskRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface RarityConfig {
  name: TaskRarity;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  xpMultiplier: number;
  icon: string;
  particleColor: string;
}

export const RARITY_CONFIG: Record<TaskRarity, RarityConfig> = {
  common: {
    name: 'common',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-400',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    xpMultiplier: 1,
    icon: '⚪',
    particleColor: '#9ca3af'
  },
  rare: {
    name: 'rare',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-500',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    xpMultiplier: 1.5,
    icon: '🔵',
    particleColor: '#3b82f6'
  },
  epic: {
    name: 'epic',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-500',
    glowColor: 'rgba(147, 51, 234, 0.4)',
    xpMultiplier: 2,
    icon: '🟣',
    particleColor: '#9333ea'
  },
  legendary: {
    name: 'legendary',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-500',
    glowColor: 'rgba(250, 204, 21, 0.5)',
    xpMultiplier: 3,
    icon: '🟡',
    particleColor: '#facc15'
  }
};

export class TaskRaritySystem {
  // Calculate rarity based on task properties
  static calculateRarity(task: {
    est_minutes: number;
    title: string;
    created_at?: string;
    importance?: number;
  }): TaskRarity {
    let score = 0;

    // Time factor (longer = rarer)
    if (task.est_minutes >= 120) score += 30;
    else if (task.est_minutes >= 60) score += 20;
    else if (task.est_minutes >= 30) score += 10;

    // Title complexity (more words = potentially more complex)
    const wordCount = task.title.split(' ').length;
    if (wordCount >= 8) score += 20;
    else if (wordCount >= 5) score += 10;

    // Keywords that indicate importance
    const importantKeywords = [
      'urgent', 'important', 'critical', 'deadline', 'asap',
      'pilne', 'ważne', 'krytyczne', 'termin', 'natychmiast'
    ];
    const hasImportantKeyword = importantKeywords.some(keyword => 
      task.title.toLowerCase().includes(keyword)
    );
    if (hasImportantKeyword) score += 25;

    // Random factor for variety
    score += Math.random() * 20;

    // Importance level (if provided)
    if (task.importance) {
      score += task.importance * 10;
    }

    // Time of creation (tasks created at odd hours are rarer)
    if (task.created_at) {
      const hour = new Date(task.created_at).getHours();
      if (hour < 6 || hour > 22) score += 15;
    }

    // Determine rarity based on score
    if (score >= 80) return 'legendary';
    if (score >= 60) return 'epic';
    if (score >= 40) return 'rare';
    return 'common';
  }

  // Get XP for task based on rarity
  static getXPReward(baseXP: number, rarity: TaskRarity): number {
    const config = RARITY_CONFIG[rarity];
    return Math.round(baseXP * config.xpMultiplier);
  }

  // Generate loot table for completed tasks
  static generateLoot(rarity: TaskRarity): {
    xpBonus: number;
    items: string[];
    specialReward?: string;
  } {
    const lootTable = {
      common: {
        xpBonus: 0,
        items: ['Small XP Boost'],
        specialReward: undefined
      },
      rare: {
        xpBonus: 25,
        items: ['Medium XP Boost', '5 min Time Extension'],
        specialReward: Math.random() > 0.8 ? 'Streak Protector' : undefined
      },
      epic: {
        xpBonus: 50,
        items: ['Large XP Boost', '10 min Time Extension', 'Focus Shield'],
        specialReward: Math.random() > 0.6 ? 'Double XP Token' : undefined
      },
      legendary: {
        xpBonus: 100,
        items: ['Mega XP Boost', '30 min Time Extension', 'Master Focus', 'Task Skip Token'],
        specialReward: 'Legendary Title: Task Slayer'
      }
    };

    return lootTable[rarity];
  }

  // Get special effects for task cards
  static getSpecialEffects(rarity: TaskRarity): {
    animation: string;
    particles: boolean;
    glow: boolean;
    sound: string;
  } {
    const effects = {
      common: {
        animation: '',
        particles: false,
        glow: false,
        sound: 'taskComplete'
      },
      rare: {
        animation: 'pulse',
        particles: false,
        glow: true,
        sound: 'rareComplete'
      },
      epic: {
        animation: 'shimmer',
        particles: true,
        glow: true,
        sound: 'epicComplete'
      },
      legendary: {
        animation: 'rainbow',
        particles: true,
        glow: true,
        sound: 'legendaryComplete'
      }
    };

    return effects[rarity];
  }

  // Check for rarity upgrade chance
  static checkForUpgrade(
    currentRarity: TaskRarity,
    comboMultiplier: number
  ): { upgraded: boolean; newRarity: TaskRarity } {
    const upgradeChance = 0.1 * comboMultiplier; // 10% base chance * combo
    const roll = Math.random();

    if (roll < upgradeChance) {
      const rarityOrder: TaskRarity[] = ['common', 'rare', 'epic', 'legendary'];
      const currentIndex = rarityOrder.indexOf(currentRarity);
      
      if (currentIndex < rarityOrder.length - 1) {
        return {
          upgraded: true,
          newRarity: rarityOrder[currentIndex + 1]
        };
      }
    }

    return { upgraded: false, newRarity: currentRarity };
  }
}