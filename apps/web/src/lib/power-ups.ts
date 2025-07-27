export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'boost' | 'shield' | 'utility' | 'special';
  effect: {
    type: string;
    value: number;
    duration?: number; // in minutes
  };
  cost: number; // in points/coins
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cooldown?: number; // in minutes
  maxStack?: number;
  unlockLevel?: number;
}

export const POWER_UPS: PowerUp[] = [
  // XP Boosts
  {
    id: 'xp_boost_small',
    name: '2x XP Boost',
    description: 'Podwaja zdobywane XP przez 30 minut',
    icon: '⚡',
    type: 'boost',
    effect: { type: 'xp_multiplier', value: 2, duration: 30 },
    cost: 100,
    rarity: 'common',
    cooldown: 60
  },
  {
    id: 'xp_boost_large',
    name: '3x XP Boost',
    description: 'Potraja zdobywane XP przez 15 minut',
    icon: '⚡⚡',
    type: 'boost',
    effect: { type: 'xp_multiplier', value: 3, duration: 15 },
    cost: 250,
    rarity: 'rare',
    cooldown: 120,
    unlockLevel: 10
  },
  {
    id: 'xp_boost_mega',
    name: '5x XP Mega Boost',
    description: 'Pięciokrotne XP przez 5 minut - użyj mądrze!',
    icon: '⚡⚡⚡',
    type: 'boost',
    effect: { type: 'xp_multiplier', value: 5, duration: 5 },
    cost: 500,
    rarity: 'epic',
    cooldown: 360,
    unlockLevel: 20
  },

  // Time Manipulation
  {
    id: 'time_freeze',
    name: 'Time Freeze',
    description: 'Zatrzymuje timer na 10 minut',
    icon: '⏰',
    type: 'utility',
    effect: { type: 'time_freeze', value: 10 },
    cost: 150,
    rarity: 'rare',
    maxStack: 3
  },
  {
    id: 'time_extension',
    name: '+15 Min',
    description: 'Dodaje 15 minut do bieżącego zadania',
    icon: '⏱️',
    type: 'utility',
    effect: { type: 'time_extend', value: 15 },
    cost: 75,
    rarity: 'common',
    maxStack: 5
  },

  // Protection
  {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    description: 'Chroni Twoją serię przez 1 dzień',
    icon: '🧊',
    type: 'shield',
    effect: { type: 'streak_protection', value: 1 },
    cost: 300,
    rarity: 'rare',
    maxStack: 2
  },
  {
    id: 'focus_shield',
    name: 'Focus Shield',
    description: 'Blokuje wszystkie rozproszenia na 25 minut',
    icon: '🛡️',
    type: 'shield',
    effect: { type: 'distraction_block', value: 25, duration: 25 },
    cost: 200,
    rarity: 'rare',
    cooldown: 60,
    unlockLevel: 15
  },

  // Utility
  {
    id: 'task_skip',
    name: 'Task Skip Token',
    description: 'Pozwala pominąć jedno zadanie bez utraty serii',
    icon: '⏭️',
    type: 'utility',
    effect: { type: 'task_skip', value: 1 },
    cost: 400,
    rarity: 'epic',
    maxStack: 1,
    unlockLevel: 25
  },
  {
    id: 'instant_complete',
    name: 'Instant Complete',
    description: 'Natychmiastowo ukończ zadanie do 30 minut',
    icon: '✨',
    type: 'special',
    effect: { type: 'instant_complete', value: 30 },
    cost: 800,
    rarity: 'legendary',
    maxStack: 1,
    cooldown: 1440, // 24 hours
    unlockLevel: 30
  },
  {
    id: 'combo_saver',
    name: 'Combo Saver',
    description: 'Resetuje timer combo do pełnego',
    icon: '🔥',
    type: 'utility',
    effect: { type: 'combo_reset', value: 1 },
    cost: 100,
    rarity: 'common',
    maxStack: 3
  },

  // Special Power-ups
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    description: 'Zwiększa szansę na rzadkie zadania przez 1 godzinę',
    icon: '🍀',
    type: 'special',
    effect: { type: 'rarity_boost', value: 2, duration: 60 },
    cost: 350,
    rarity: 'epic',
    cooldown: 180,
    unlockLevel: 20
  },
  {
    id: 'energy_drink',
    name: 'Energy Drink',
    description: 'Wszystkie zadania wydają się łatwiejsze przez 20 min',
    icon: '🥤',
    type: 'boost',
    effect: { type: 'motivation_boost', value: 1.5, duration: 20 },
    cost: 50,
    rarity: 'common'
  },
  {
    id: 'wisdom_scroll',
    name: 'Zwój Mądrości',
    description: 'Pokazuje optymalną kolejność zadań',
    icon: '📜',
    type: 'special',
    effect: { type: 'task_optimization', value: 1 },
    cost: 150,
    rarity: 'rare',
    unlockLevel: 12
  }
];

export class PowerUpSystem {
  private static activePowerUps: Map<string, { 
    powerUp: PowerUp; 
    expiresAt?: Date;
    stackCount: number;
  }> = new Map();

  static canPurchase(powerUp: PowerUp, userPoints: number, userLevel: number): {
    canBuy: boolean;
    reason?: string;
  } {
    // Check cost
    if (userPoints < powerUp.cost) {
      return { canBuy: false, reason: `Potrzebujesz ${powerUp.cost - userPoints} więcej punktów` };
    }

    // Check level requirement
    if (powerUp.unlockLevel && userLevel < powerUp.unlockLevel) {
      return { canBuy: false, reason: `Wymagany poziom ${powerUp.unlockLevel}` };
    }

    // Check cooldown
    const active = this.activePowerUps.get(powerUp.id);
    if (active && powerUp.cooldown) {
      const cooldownEnd = new Date(active.expiresAt!.getTime() + powerUp.cooldown * 60000);
      if (cooldownEnd > new Date()) {
        const minutesLeft = Math.ceil((cooldownEnd.getTime() - Date.now()) / 60000);
        return { canBuy: false, reason: `Cooldown: ${minutesLeft} min` };
      }
    }

    // Check max stack
    if (powerUp.maxStack && active && active.stackCount >= powerUp.maxStack) {
      return { canBuy: false, reason: `Max ${powerUp.maxStack} sztuk` };
    }

    return { canBuy: true };
  }

  static activatePowerUp(powerUp: PowerUp): void {
    const existing = this.activePowerUps.get(powerUp.id);
    
    if (existing && powerUp.maxStack) {
      // Stack the power-up
      existing.stackCount = Math.min(existing.stackCount + 1, powerUp.maxStack);
      if (powerUp.effect.duration) {
        // Extend duration for stackable duration-based power-ups
        const newExpiry = new Date(existing.expiresAt!.getTime() + powerUp.effect.duration * 60000);
        existing.expiresAt = newExpiry;
      }
    } else {
      // New activation
      const expiresAt = powerUp.effect.duration 
        ? new Date(Date.now() + powerUp.effect.duration * 60000)
        : undefined;

      this.activePowerUps.set(powerUp.id, {
        powerUp,
        expiresAt,
        stackCount: 1
      });
    }

    // Save to localStorage
    this.savePowerUps();
  }

  static getActivePowerUps(): Array<{ 
    powerUp: PowerUp; 
    timeLeft?: number; // in minutes
    stackCount: number;
  }> {
    const now = new Date();
    const active: Array<any> = [];

    this.activePowerUps.forEach((value, key) => {
      if (value.expiresAt && value.expiresAt < now) {
        // Expired, remove it
        this.activePowerUps.delete(key);
      } else {
        const timeLeft = value.expiresAt 
          ? Math.ceil((value.expiresAt.getTime() - now.getTime()) / 60000)
          : undefined;
        
        active.push({
          powerUp: value.powerUp,
          timeLeft,
          stackCount: value.stackCount
        });
      }
    });

    return active;
  }

  static getXPMultiplier(): number {
    let multiplier = 1;
    
    this.getActivePowerUps().forEach(({ powerUp }) => {
      if (powerUp.effect.type === 'xp_multiplier') {
        multiplier *= powerUp.effect.value;
      }
    });

    return multiplier;
  }

  static hasActivePowerUp(powerUpId: string): boolean {
    const active = this.activePowerUps.get(powerUpId);
    if (!active) return false;
    
    if (active.expiresAt && active.expiresAt < new Date()) {
      this.activePowerUps.delete(powerUpId);
      return false;
    }
    
    return true;
  }

  static consumeStackablePowerUp(powerUpId: string): boolean {
    const active = this.activePowerUps.get(powerUpId);
    if (!active) return false;

    active.stackCount--;
    if (active.stackCount <= 0) {
      this.activePowerUps.delete(powerUpId);
    }

    this.savePowerUps();
    return true;
  }

  private static savePowerUps(): void {
    const data = Array.from(this.activePowerUps.entries()).map(([key, value]) => ({
      key,
      powerUpId: value.powerUp.id,
      expiresAt: value.expiresAt?.toISOString(),
      stackCount: value.stackCount
    }));

    localStorage.setItem('active_powerups', JSON.stringify(data));
  }

  static loadPowerUps(): void {
    const saved = localStorage.getItem('active_powerups');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      const now = new Date();

      data.forEach((item: any) => {
        const powerUp = POWER_UPS.find(p => p.id === item.powerUpId);
        if (!powerUp) return;

        const expiresAt = item.expiresAt ? new Date(item.expiresAt) : undefined;
        if (expiresAt && expiresAt < now) return; // Skip expired

        this.activePowerUps.set(item.key, {
          powerUp,
          expiresAt,
          stackCount: item.stackCount || 1
        });
      });
    } catch (error) {
      console.error('Failed to load power-ups:', error);
    }
  }
}