export interface BossPhase {
  health: number;
  name: string;
  description: string;
  requiredHits: number;
  mechanics: {
    type: 'time_limit' | 'streak_requirement' | 'no_breaks' | 'perfect_accuracy' | 'speed_run';
    value?: number;
    description: string;
  }[];
  rewards: {
    xp: number;
    points: number;
    items?: string[];
    achievements?: string[];
  };
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'normal' | 'hard' | 'legendary' | 'mythic';
  totalHealth: number;
  phases: BossPhase[];
  unlockLevel: number;
  cooldownHours: number;
  weaknesses?: string[];
  resistances?: string[];
  lore?: string;
}

export interface BossBattleState {
  bossId: string;
  currentHealth: number;
  currentPhase: number;
  startedAt: Date;
  tasksCompleted: number;
  damageDealt: number;
  comboCount: number;
  status: 'preparing' | 'fighting' | 'victory' | 'defeat';
  attempts: number;
}

export const BOSSES: Boss[] = [
  {
    id: 'procrastination_demon',
    name: 'Demon Prokrastynacji',
    title: 'Władca Odkładania',
    description: 'Pradawny demon, który karmi się niezdecydowaniem i lenistwem',
    icon: '👹',
    difficulty: 'normal',
    totalHealth: 100,
    unlockLevel: 10,
    cooldownHours: 24,
    weaknesses: ['morning_tasks', 'quick_wins'],
    resistances: ['long_tasks'],
    lore: 'Powstał z pierwszego "zrobię to później" wypowiedzianego przez człowieka',
    phases: [
      {
        health: 100,
        name: 'Faza Wątpliwości',
        description: 'Boss sieje wątpliwości w Twoje możliwości',
        requiredHits: 3,
        mechanics: [
          {
            type: 'time_limit',
            value: 30,
            description: 'Ukończ zadanie w 30 minut lub otrzymasz karę'
          }
        ],
        rewards: {
          xp: 100,
          points: 50
        }
      },
      {
        health: 50,
        name: 'Faza Pokusy',
        description: 'Boss kusi Cię rozrywkami i prokrastynacją',
        requiredHits: 5,
        mechanics: [
          {
            type: 'streak_requirement',
            value: 3,
            description: 'Utrzymaj 3-zadaniowe combo'
          },
          {
            type: 'no_breaks',
            description: 'Nie rób przerw dłuższych niż 5 minut'
          }
        ],
        rewards: {
          xp: 200,
          points: 100,
          items: ['Focus Shield']
        }
      }
    ]
  },
  {
    id: 'distraction_hydra',
    name: 'Hydra Rozproszenia',
    title: 'Wielogłowy Koszmar Skupienia',
    description: 'Za każde odcięte rozproszenie, wyrastają dwa nowe',
    icon: '🐉',
    difficulty: 'hard',
    totalHealth: 200,
    unlockLevel: 20,
    cooldownHours: 48,
    weaknesses: ['focus_sessions', 'single_tasking'],
    resistances: ['multitasking', 'social_media'],
    phases: [
      {
        health: 200,
        name: 'Faza Jednej Głowy',
        description: 'Hydra atakuje pojedynczymi rozproszeniami',
        requiredHits: 5,
        mechanics: [
          {
            type: 'perfect_accuracy',
            description: 'Ukończ zadania dokładnie w oszacowanym czasie'
          }
        ],
        rewards: {
          xp: 150,
          points: 75
        }
      },
      {
        health: 100,
        name: 'Faza Wielu Głów',
        description: 'Wszystkie głowy atakują jednocześnie',
        requiredHits: 7,
        mechanics: [
          {
            type: 'speed_run',
            value: 3,
            description: 'Ukończ 3 zadania w ciągu 45 minut'
          },
          {
            type: 'no_breaks',
            description: 'Zero przerw podczas walki'
          }
        ],
        rewards: {
          xp: 300,
          points: 150,
          items: ['2x XP Boost', 'Time Freeze'],
          achievements: ['hydra_slayer']
        }
      }
    ]
  },
  {
    id: 'perfectionism_sphinx',
    name: 'Sfinks Perfekcjonizmu',
    title: 'Strażnik Niemożliwych Standardów',
    description: 'Zadaje zagadki, na które nie ma idealnej odpowiedzi',
    icon: '🦁',
    difficulty: 'legendary',
    totalHealth: 300,
    unlockLevel: 30,
    cooldownHours: 72,
    weaknesses: ['done_is_better', 'mvp_approach'],
    resistances: ['overthinking', 'endless_polishing'],
    lore: 'Starożytny strażnik, który paraliżuje działanie żądaniem perfekcji',
    phases: [
      {
        health: 300,
        name: 'Zagadka Pierwsza',
        description: 'Czy jest coś lepszego niż perfekcja?',
        requiredHits: 5,
        mechanics: [
          {
            type: 'time_limit',
            value: 20,
            description: 'Szybkie decyzje - max 20 min na zadanie'
          }
        ],
        rewards: {
          xp: 200,
          points: 100
        }
      },
      {
        health: 200,
        name: 'Zagadka Druga',
        description: 'Kiedy wystarczająco dobre jest doskonałe?',
        requiredHits: 7,
        mechanics: [
          {
            type: 'streak_requirement',
            value: 5,
            description: '5 zadań bez poprawek'
          }
        ],
        rewards: {
          xp: 300,
          points: 150
        }
      },
      {
        health: 100,
        name: 'Zagadka Ostateczna',
        description: 'Pokonaj mnie, nie będąc perfekcyjnym',
        requiredHits: 10,
        mechanics: [
          {
            type: 'speed_run',
            value: 10,
            description: '10 zadań, każde "wystarczająco dobre"'
          },
          {
            type: 'no_breaks',
            description: 'Działaj bez wahania'
          }
        ],
        rewards: {
          xp: 500,
          points: 300,
          items: ['Instant Complete', '3x XP Boost'],
          achievements: ['perfectionism_breaker', 'sphinx_solver']
        }
      }
    ]
  },
  {
    id: 'chaos_leviathan',
    name: 'Lewiatan Chaosu',
    title: 'Władca Nieładu i Entropii',
    description: 'Potężna bestia, która karmi się brakiem organizacji',
    icon: '🐋',
    difficulty: 'mythic',
    totalHealth: 500,
    unlockLevel: 50,
    cooldownHours: 168, // 1 week
    weaknesses: ['organized_approach', 'systematic_work'],
    resistances: ['chaos', 'randomness'],
    lore: 'Najstarszy z bossów, istniejący od zarania czasu, gdy wszechświat był czystym chaosem',
    phases: [
      {
        health: 500,
        name: 'Fala Chaosu',
        description: 'Lewiatan zalewa Cię falą nieuporządkowanych zadań',
        requiredHits: 10,
        mechanics: [
          {
            type: 'perfect_accuracy',
            description: 'Perfekcyjna organizacja - dokładne oszacowania'
          },
          {
            type: 'streak_requirement',
            value: 7,
            description: 'Utrzymaj 7-zadaniową serię'
          }
        ],
        rewards: {
          xp: 400,
          points: 200
        }
      },
      {
        health: 300,
        name: 'Wir Entropii',
        description: 'Wszystko rozpada się w chaos',
        requiredHits: 15,
        mechanics: [
          {
            type: 'speed_run',
            value: 5,
            description: '5 zadań w 60 minut'
          },
          {
            type: 'no_breaks',
            description: 'Nieustanna praca'
          },
          {
            type: 'time_limit',
            value: 15,
            description: 'Każde zadanie max 15 minut'
          }
        ],
        rewards: {
          xp: 600,
          points: 300,
          items: ['Time Freeze x3', 'Focus Shield x2']
        }
      },
      {
        health: 100,
        name: 'Oko Burzy',
        description: 'Finalna konfrontacja w centrum chaosu',
        requiredHits: 20,
        mechanics: [
          {
            type: 'streak_requirement',
            value: 10,
            description: 'Legendarne 10-zadaniowe combo'
          },
          {
            type: 'perfect_accuracy',
            description: 'Mistrzowska precyzja'
          },
          {
            type: 'speed_run',
            value: 20,
            description: '20 zadań, jedno po drugim'
          }
        ],
        rewards: {
          xp: 1000,
          points: 500,
          items: ['Legendary Loot Box', '5x XP Mega Boost', 'Chaos Crown'],
          achievements: ['leviathan_slayer', 'chaos_master', 'mythic_warrior']
        }
      }
    ]
  }
];

export class BossBattleSystem {
  private static currentBattle: BossBattleState | null = null;
  private static defeatedBosses: Map<string, Date> = new Map();

  static canChallengeBoss(bossId: string, userLevel: number): {
    canChallenge: boolean;
    reason?: string;
  } {
    const boss = BOSSES.find(b => b.id === bossId);
    if (!boss) {
      return { canChallenge: false, reason: 'Boss nie istnieje' };
    }

    if (userLevel < boss.unlockLevel) {
      return { canChallenge: false, reason: `Wymagany poziom ${boss.unlockLevel}` };
    }

    const lastDefeat = this.defeatedBosses.get(bossId);
    if (lastDefeat) {
      const cooldownEnd = new Date(lastDefeat.getTime() + boss.cooldownHours * 60 * 60 * 1000);
      if (cooldownEnd > new Date()) {
        const hoursLeft = Math.ceil((cooldownEnd.getTime() - Date.now()) / (60 * 60 * 1000));
        return { canChallenge: false, reason: `Cooldown: ${hoursLeft}h` };
      }
    }

    if (this.currentBattle && this.currentBattle.status === 'fighting') {
      return { canChallenge: false, reason: 'Już walczysz z bossem' };
    }

    return { canChallenge: true };
  }

  static startBattle(bossId: string): BossBattleState | null {
    const boss = BOSSES.find(b => b.id === bossId);
    if (!boss) return null;

    this.currentBattle = {
      bossId,
      currentHealth: boss.totalHealth,
      currentPhase: 0,
      startedAt: new Date(),
      tasksCompleted: 0,
      damageDealt: 0,
      comboCount: 0,
      status: 'preparing',
      attempts: (this.currentBattle?.bossId === bossId ? this.currentBattle.attempts + 1 : 1)
    };

    this.saveBattleState();
    return this.currentBattle;
  }

  static dealDamage(damage: number, taskInfo?: {
    completedInTime: boolean;
    maintainedStreak: boolean;
    perfectAccuracy: boolean;
  }): {
    damageDealt: number;
    phaseComplete: boolean;
    battleWon: boolean;
    rewards?: any;
  } {
    if (!this.currentBattle || this.currentBattle.status !== 'fighting') {
      return { damageDealt: 0, phaseComplete: false, battleWon: false };
    }

    const boss = BOSSES.find(b => b.id === this.currentBattle!.bossId);
    if (!boss) {
      return { damageDealt: 0, phaseComplete: false, battleWon: false };
    }

    // Calculate damage multipliers
    let finalDamage = damage;
    if (taskInfo) {
      if (taskInfo.completedInTime) finalDamage *= 1.2;
      if (taskInfo.maintainedStreak) finalDamage *= 1.5;
      if (taskInfo.perfectAccuracy) finalDamage *= 2;
    }

    // Apply damage
    this.currentBattle.currentHealth -= finalDamage;
    this.currentBattle.damageDealt += finalDamage;
    this.currentBattle.tasksCompleted++;

    // Check phase completion
    const currentPhase = boss.phases[this.currentBattle.currentPhase];
    const phaseHealthThreshold = boss.totalHealth - currentPhase.health;
    const phaseComplete = this.currentBattle.damageDealt >= phaseHealthThreshold;

    if (phaseComplete && this.currentBattle.currentPhase < boss.phases.length - 1) {
      this.currentBattle.currentPhase++;
    }

    // Check battle completion
    const battleWon = this.currentBattle.currentHealth <= 0;
    if (battleWon) {
      this.currentBattle.status = 'victory';
      
      // Calculate total rewards BEFORE marking as defeated
      const rewards = this.calculateRewards(boss);
      
      // Now mark as defeated
      this.defeatedBosses.set(boss.id, new Date());
      this.saveBattleState();
      
      return {
        damageDealt: finalDamage,
        phaseComplete,
        battleWon: true,
        rewards
      };
    }

    this.saveBattleState();
    return {
      damageDealt: finalDamage,
      phaseComplete,
      battleWon: false
    };
  }

  static getCurrentBattle(): BossBattleState | null {
    return this.currentBattle;
  }

  static getBossInfo(bossId: string): Boss | undefined {
    return BOSSES.find(b => b.id === bossId);
  }

  static checkMechanicViolation(mechanicType: string, value?: any): boolean {
    if (!this.currentBattle || this.currentBattle.status !== 'fighting') {
      return false;
    }

    const boss = BOSSES.find(b => b.id === this.currentBattle!.bossId);
    if (!boss) return false;

    const currentPhase = boss.phases[this.currentBattle.currentPhase];
    const mechanic = currentPhase.mechanics.find(m => m.type === mechanicType);

    if (!mechanic) return false;

    switch (mechanic.type) {
      case 'time_limit':
        return value > mechanic.value!;
      case 'streak_requirement':
        return value < mechanic.value!;
      case 'no_breaks':
        return value > 5; // 5 minute break limit
      case 'perfect_accuracy':
        return !value;
      case 'speed_run':
        // This is checked elsewhere
        return false;
      default:
        return false;
    }
  }

  static forfeitBattle(): void {
    if (this.currentBattle) {
      this.currentBattle.status = 'defeat';
      this.saveBattleState();
    }
  }

  private static calculateRewards(boss: Boss): any {
    const rewards = {
      totalXP: 0,
      totalPoints: 0,
      items: [] as string[],
      achievements: [] as string[]
    };

    // Sum up all phase rewards
    boss.phases.forEach(phase => {
      rewards.totalXP += phase.rewards.xp;
      rewards.totalPoints += phase.rewards.points;
      if (phase.rewards.items) {
        rewards.items.push(...phase.rewards.items);
      }
      if (phase.rewards.achievements) {
        rewards.achievements.push(...phase.rewards.achievements);
      }
    });

    // Difficulty multipliers
    const difficultyMultipliers = {
      normal: 1,
      hard: 1.5,
      legendary: 2,
      mythic: 3
    };

    const multiplier = difficultyMultipliers[boss.difficulty];
    rewards.totalXP = Math.round(rewards.totalXP * multiplier);
    rewards.totalPoints = Math.round(rewards.totalPoints * multiplier);

    // First time defeat bonus
    if (!this.defeatedBosses.has(boss.id)) {
      rewards.totalXP *= 2;
      rewards.totalPoints *= 2;
      rewards.achievements.push('first_' + boss.id + '_defeat');
    }

    return rewards;
  }

  private static saveBattleState(): void {
    if (this.currentBattle) {
      localStorage.setItem('current_boss_battle', JSON.stringify(this.currentBattle));
    } else {
      localStorage.removeItem('current_boss_battle');
    }

    const defeatedData = Array.from(this.defeatedBosses.entries()).map(([id, date]) => ({
      id,
      date: date.toISOString()
    }));
    localStorage.setItem('defeated_bosses', JSON.stringify(defeatedData));
  }

  static loadBattleState(): void {
    const savedBattle = localStorage.getItem('current_boss_battle');
    if (savedBattle) {
      try {
        const battle = JSON.parse(savedBattle);
        battle.startedAt = new Date(battle.startedAt);
        this.currentBattle = battle;
      } catch (error) {
        console.error('Failed to load battle state:', error);
      }
    }

    const savedDefeated = localStorage.getItem('defeated_bosses');
    if (savedDefeated) {
      try {
        const defeated = JSON.parse(savedDefeated);
        defeated.forEach((item: any) => {
          this.defeatedBosses.set(item.id, new Date(item.date));
        });
      } catch (error) {
        console.error('Failed to load defeated bosses:', error);
      }
    }
  }
}
