export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  currentLevel?: number;
  cost: {
    points: number;
    level: number;
  };
  effects: {
    type: string;
    value: number;
    perLevel?: number;
  }[];
  requirements?: {
    nodeId: string;
    minLevel: number;
  }[];
  position: {
    x: number;
    y: number;
  };
}

export interface SkillTree {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  nodes: SkillNode[];
}

export const SKILL_TREES: SkillTree[] = [
  {
    id: 'productivity',
    name: 'Produktywność',
    description: 'Zwiększ swoją efektywność i szybkość wykonywania zadań',
    icon: '⚡',
    color: 'blue',
    nodes: [
      {
        id: 'time_mastery',
        name: 'Mistrzostwo Czasu',
        description: 'Lepiej szacuj czas potrzebny na zadania',
        icon: '⏱️',
        maxLevel: 5,
        cost: { points: 100, level: 5 },
        position: { x: 50, y: 20 },
        effects: [
          {
            type: 'estimation_accuracy',
            value: 5,
            perLevel: 5
          }
        ]
      },
      {
        id: 'quick_start',
        name: 'Szybki Start',
        description: 'Rozpoczynaj zadania szybciej',
        icon: '🚀',
        maxLevel: 3,
        cost: { points: 150, level: 10 },
        position: { x: 20, y: 40 },
        requirements: [
          { nodeId: 'time_mastery', minLevel: 2 }
        ],
        effects: [
          {
            type: 'task_start_bonus',
            value: 10,
            perLevel: 10
          }
        ]
      },
      {
        id: 'deep_focus',
        name: 'Głębokie Skupienie',
        description: 'Wejdź w stan flow łatwiej',
        icon: '🎯',
        maxLevel: 5,
        cost: { points: 200, level: 15 },
        position: { x: 80, y: 40 },
        requirements: [
          { nodeId: 'time_mastery', minLevel: 3 }
        ],
        effects: [
          {
            type: 'focus_duration',
            value: 10,
            perLevel: 10
          },
          {
            type: 'distraction_resistance',
            value: 20,
            perLevel: 20
          }
        ]
      },
      {
        id: 'multitasking',
        name: 'Multitasking',
        description: 'Zarządzaj wieloma zadaniami jednocześnie',
        icon: '🔄',
        maxLevel: 3,
        cost: { points: 300, level: 20 },
        position: { x: 50, y: 60 },
        requirements: [
          { nodeId: 'quick_start', minLevel: 2 },
          { nodeId: 'deep_focus', minLevel: 2 }
        ],
        effects: [
          {
            type: 'parallel_tasks',
            value: 1,
            perLevel: 1
          }
        ]
      },
      {
        id: 'productivity_master',
        name: 'Mistrz Produktywności',
        description: 'Ostateczna forma wydajności',
        icon: '👑',
        maxLevel: 1,
        cost: { points: 1000, level: 30 },
        position: { x: 50, y: 85 },
        requirements: [
          { nodeId: 'multitasking', minLevel: 3 }
        ],
        effects: [
          {
            type: 'global_productivity',
            value: 50
          },
          {
            type: 'xp_multiplier',
            value: 2
          }
        ]
      }
    ]
  },
  {
    id: 'gamification',
    name: 'Gamifikacja',
    description: 'Zwiększ nagrody i bonusy za wykonywanie zadań',
    icon: '🎮',
    color: 'purple',
    nodes: [
      {
        id: 'xp_boost',
        name: 'XP Boost',
        description: 'Zdobywaj więcej doświadczenia',
        icon: '✨',
        maxLevel: 10,
        cost: { points: 50, level: 3 },
        position: { x: 50, y: 20 },
        effects: [
          {
            type: 'xp_gain',
            value: 5,
            perLevel: 5
          }
        ]
      },
      {
        id: 'lucky_drops',
        name: 'Szczęśliwe Łupy',
        description: 'Zwiększ szansę na rzadkie nagrody',
        icon: '🍀',
        maxLevel: 5,
        cost: { points: 100, level: 8 },
        position: { x: 20, y: 40 },
        requirements: [
          { nodeId: 'xp_boost', minLevel: 3 }
        ],
        effects: [
          {
            type: 'rare_drop_chance',
            value: 10,
            perLevel: 10
          }
        ]
      },
      {
        id: 'combo_master',
        name: 'Mistrz Combo',
        description: 'Dłuższe i potężniejsze combo',
        icon: '🔥',
        maxLevel: 5,
        cost: { points: 150, level: 12 },
        position: { x: 80, y: 40 },
        requirements: [
          { nodeId: 'xp_boost', minLevel: 5 }
        ],
        effects: [
          {
            type: 'combo_duration',
            value: 5,
            perLevel: 5
          },
          {
            type: 'combo_multiplier',
            value: 0.1,
            perLevel: 0.1
          }
        ]
      },
      {
        id: 'achievement_hunter',
        name: 'Łowca Osiągnięć',
        description: 'Zdobywaj osiągnięcia łatwiej',
        icon: '🏆',
        maxLevel: 3,
        cost: { points: 200, level: 18 },
        position: { x: 50, y: 60 },
        requirements: [
          { nodeId: 'lucky_drops', minLevel: 3 },
          { nodeId: 'combo_master', minLevel: 3 }
        ],
        effects: [
          {
            type: 'achievement_progress',
            value: 25,
            perLevel: 25
          }
        ]
      },
      {
        id: 'legendary_loot',
        name: 'Legendarne Łupy',
        description: 'Gwarantowane legendarne nagrody',
        icon: '💎',
        maxLevel: 1,
        cost: { points: 1500, level: 35 },
        position: { x: 50, y: 85 },
        requirements: [
          { nodeId: 'achievement_hunter', minLevel: 3 }
        ],
        effects: [
          {
            type: 'legendary_guarantee',
            value: 1
          },
          {
            type: 'loot_multiplier',
            value: 3
          }
        ]
      }
    ]
  },
  {
    id: 'resilience',
    name: 'Odporność',
    description: 'Pokonuj prokrastynację i rozproszenia',
    icon: '🛡️',
    color: 'green',
    nodes: [
      {
        id: 'willpower',
        name: 'Siła Woli',
        description: 'Podstawowa odporność na prokrastynację',
        icon: '💪',
        maxLevel: 10,
        cost: { points: 75, level: 5 },
        position: { x: 50, y: 20 },
        effects: [
          {
            type: 'procrastination_resistance',
            value: 5,
            perLevel: 5
          }
        ]
      },
      {
        id: 'streak_shield',
        name: 'Tarcza Serii',
        description: 'Chroń swoją serię zadań',
        icon: '🛡️',
        maxLevel: 3,
        cost: { points: 120, level: 10 },
        position: { x: 20, y: 40 },
        requirements: [
          { nodeId: 'willpower', minLevel: 4 }
        ],
        effects: [
          {
            type: 'streak_protection',
            value: 1,
            perLevel: 1
          }
        ]
      },
      {
        id: 'distraction_immunity',
        name: 'Immunitet na Rozproszenia',
        description: 'Ignoruj rozpraszacze',
        icon: '🚫',
        maxLevel: 5,
        cost: { points: 180, level: 15 },
        position: { x: 80, y: 40 },
        requirements: [
          { nodeId: 'willpower', minLevel: 6 }
        ],
        effects: [
          {
            type: 'distraction_block',
            value: 20,
            perLevel: 20
          }
        ]
      },
      {
        id: 'phoenix_mode',
        name: 'Tryb Feniksa',
        description: 'Powstań silniejszy po porażce',
        icon: '🔥',
        maxLevel: 3,
        cost: { points: 250, level: 22 },
        position: { x: 50, y: 60 },
        requirements: [
          { nodeId: 'streak_shield', minLevel: 2 },
          { nodeId: 'distraction_immunity', minLevel: 3 }
        ],
        effects: [
          {
            type: 'comeback_bonus',
            value: 50,
            perLevel: 50
          }
        ]
      },
      {
        id: 'unbreakable',
        name: 'Niezniszczalny',
        description: 'Absolutna odporność mentalna',
        icon: '💎',
        maxLevel: 1,
        cost: { points: 2000, level: 40 },
        position: { x: 50, y: 85 },
        requirements: [
          { nodeId: 'phoenix_mode', minLevel: 3 }
        ],
        effects: [
          {
            type: 'failure_immunity',
            value: 1
          },
          {
            type: 'mental_fortress',
            value: 100
          }
        ]
      }
    ]
  }
];

export class SkillTreeSystem {
  private static unlockedSkills: Map<string, number> = new Map();
  private static skillPoints: number = 0;

  static getSkillPoints(): number {
    return this.skillPoints;
  }

  static addSkillPoints(points: number): void {
    this.skillPoints += points;
    this.saveProgress();
  }

  static canUnlockSkill(nodeId: string, treeId: string, userLevel: number): {
    canUnlock: boolean;
    reason?: string;
  } {
    const tree = SKILL_TREES.find(t => t.id === treeId);
    if (!tree) return { canUnlock: false, reason: 'Drzewo nie istnieje' };

    const node = tree.nodes.find(n => n.id === nodeId);
    if (!node) return { canUnlock: false, reason: 'Umiejętność nie istnieje' };

    const currentLevel = this.unlockedSkills.get(`${treeId}.${nodeId}`) || 0;
    
    // Check if already maxed
    if (currentLevel >= node.maxLevel) {
      return { canUnlock: false, reason: 'Maksymalny poziom' };
    }

    // Check skill points
    if (this.skillPoints < node.cost.points) {
      return { canUnlock: false, reason: `Potrzebujesz ${node.cost.points - this.skillPoints} więcej punktów` };
    }

    // Check level requirement
    if (userLevel < node.cost.level) {
      return { canUnlock: false, reason: `Wymagany poziom ${node.cost.level}` };
    }

    // Check node requirements
    if (node.requirements) {
      for (const req of node.requirements) {
        const reqLevel = this.unlockedSkills.get(`${treeId}.${req.nodeId}`) || 0;
        if (reqLevel < req.minLevel) {
          const reqNode = tree.nodes.find(n => n.id === req.nodeId);
          return { 
            canUnlock: false, 
            reason: `Wymagane: ${reqNode?.name} poziom ${req.minLevel}` 
          };
        }
      }
    }

    return { canUnlock: true };
  }

  static unlockSkill(nodeId: string, treeId: string): boolean {
    const key = `${treeId}.${nodeId}`;
    const currentLevel = this.unlockedSkills.get(key) || 0;
    const tree = SKILL_TREES.find(t => t.id === treeId);
    const node = tree?.nodes.find(n => n.id === nodeId);
    
    if (!node) return false;

    // Spend skill points
    this.skillPoints -= node.cost.points;
    
    // Increase skill level
    this.unlockedSkills.set(key, currentLevel + 1);
    
    this.saveProgress();
    return true;
  }

  static getSkillLevel(nodeId: string, treeId: string): number {
    return this.unlockedSkills.get(`${treeId}.${nodeId}`) || 0;
  }

  static getTreeProgress(treeId: string): {
    unlockedNodes: number;
    totalNodes: number;
    percentage: number;
  } {
    const tree = SKILL_TREES.find(t => t.id === treeId);
    if (!tree) return { unlockedNodes: 0, totalNodes: 0, percentage: 0 };

    let unlockedNodes = 0;
    let totalLevels = 0;
    let unlockedLevels = 0;

    tree.nodes.forEach(node => {
      const level = this.getSkillLevel(node.id, treeId);
      if (level > 0) unlockedNodes++;
      totalLevels += node.maxLevel;
      unlockedLevels += level;
    });

    return {
      unlockedNodes,
      totalNodes: tree.nodes.length,
      percentage: totalLevels > 0 ? Math.round((unlockedLevels / totalLevels) * 100) : 0
    };
  }

  static getActiveEffects(): Map<string, number> {
    const effects = new Map<string, number>();

    SKILL_TREES.forEach(tree => {
      tree.nodes.forEach(node => {
        const level = this.getSkillLevel(node.id, tree.id);
        if (level > 0) {
          node.effects.forEach(effect => {
            const value = effect.perLevel 
              ? effect.value + (effect.perLevel * (level - 1))
              : effect.value * level;
            
            const currentValue = effects.get(effect.type) || 0;
            effects.set(effect.type, currentValue + value);
          });
        }
      });
    });

    return effects;
  }

  static resetTree(treeId: string): number {
    const tree = SKILL_TREES.find(t => t.id === treeId);
    if (!tree) return 0;

    let refundedPoints = 0;

    tree.nodes.forEach(node => {
      const level = this.getSkillLevel(node.id, treeId);
      if (level > 0) {
        refundedPoints += node.cost.points * level;
        this.unlockedSkills.delete(`${treeId}.${node.id}`);
      }
    });

    this.skillPoints += Math.floor(refundedPoints * 0.8); // 80% refund
    this.saveProgress();
    
    return Math.floor(refundedPoints * 0.8);
  }

  private static saveProgress(): void {
    const data = {
      skills: Array.from(this.unlockedSkills.entries()),
      points: this.skillPoints
    };
    localStorage.setItem('skill_tree_progress', JSON.stringify(data));
  }

  static loadProgress(): void {
    const saved = localStorage.getItem('skill_tree_progress');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      this.unlockedSkills = new Map(data.skills);
      this.skillPoints = data.points || 0;
    } catch (error) {
      console.error('Failed to load skill tree progress:', error);
    }
  }
}
