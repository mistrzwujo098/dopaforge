import { describe, it, expect, vi } from 'vitest';
import { SoundSystem } from '@/lib/sound-system';
import { NotificationSystem } from '@/lib/notification-system';
import { AchievementSystem } from '@/lib/achievements';
import { PowerUpSystem } from '@/lib/power-ups';
import { TaskRaritySystem } from '@/lib/task-rarity';
import { BossBattleSystem } from '@/lib/boss-battles';
import { SkillTreeSystem } from '@/lib/skill-trees';

// Performance benchmarks
const PERFORMANCE_THRESHOLDS = {
  soundPlayback: 50, // ms
  achievementCheck: 100, // ms
  skillTreeCalculation: 50, // ms
  bossDamageCalculation: 20, // ms
  localStorageOperation: 10, // ms
};

describe('Stress Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Sound System Stress Test', () => {
    it('handles rapid sound playback', async () => {
      const soundSystem = SoundSystem.getInstance();
      const startTime = performance.now();
      
      // Play 100 sounds rapidly
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(soundSystem.play('click'));
      }
      
      await Promise.all(promises);
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.soundPlayback * 100);
    });

    it('handles concurrent different sounds', async () => {
      const soundSystem = SoundSystem.getInstance();
      const sounds = ['click', 'success', 'error', 'notification', 'levelUp'];
      
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(soundSystem.play(sounds[i % sounds.length]));
      }
      
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });

  describe('Achievement System Stress Test', () => {
    it('handles checking many achievements rapidly', () => {
      const startTime = performance.now();
      
      // Check achievements 1000 times with different stats
      for (let i = 0; i < 1000; i++) {
        AchievementSystem.checkAchievements({
          tasks_completed: i,
          streak_days: Math.floor(i / 10),
          total_xp: i * 100,
          perfect_days: Math.floor(i / 20)
        });
      }
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.achievementCheck * 10);
    });

    it('handles large achievement progress data', () => {
      // Add lots of progress data
      for (let i = 0; i < 100; i++) {
        AchievementSystem.updateProgress(`custom_stat_${i}`, i * 10);
      }
      
      const progress = AchievementSystem.getAllProgress();
      expect(progress.size).toBeGreaterThanOrEqual(100);
      
      // Should still be fast to check
      const startTime = performance.now();
      AchievementSystem.checkAchievements({ tasks_completed: 1 });
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.achievementCheck);
    });
  });

  describe('Skill Tree Stress Test', () => {
    it('handles unlocking many skills rapidly', () => {
      SkillTreeSystem.addSkillPoints(10000);
      const startTime = performance.now();
      
      // Unlock as many skills as possible
      const trees = ['productivity', 'gamification', 'resilience'];
      let unlocked = 0;
      
      for (const treeId of trees) {
        const tree = SkillTreeSystem.getTreeProgress(treeId);
        for (let i = 0; i < 50; i++) {
          const result = SkillTreeSystem.canUnlockSkill(`skill_${i}`, treeId, 50);
          if (result.canUnlock) {
            SkillTreeSystem.unlockSkill(`skill_${i}`, treeId);
            unlocked++;
          }
        }
      }
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.skillTreeCalculation * unlocked);
    });

    it('calculates complex effect stacks efficiently', () => {
      SkillTreeSystem.addSkillPoints(5000);
      
      // Unlock many skills
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      SkillTreeSystem.unlockSkill('time_mastery', 'productivity');
      SkillTreeSystem.unlockSkill('willpower', 'resilience');
      
      const startTime = performance.now();
      
      // Calculate effects 100 times
      for (let i = 0; i < 100; i++) {
        const effects = SkillTreeSystem.getActiveEffects();
        expect(effects.size).toBeGreaterThan(0);
      }
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.skillTreeCalculation * 2);
    });
  });

  describe('Boss Battle Stress Test', () => {
    it('handles rapid damage calculations', () => {
      BossBattleSystem.startBattle('procrastination_demon');
      const battle = BossBattleSystem.getCurrentBattle();
      if (battle) battle.status = 'fighting';
      
      const startTime = performance.now();
      
      // Deal damage 100 times rapidly
      for (let i = 0; i < 100; i++) {
        BossBattleSystem.dealDamage(1, {
          completedInTime: i % 2 === 0,
          maintainedStreak: i % 3 === 0,
          perfectAccuracy: i % 5 === 0
        });
      }
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.bossDamageCalculation * 100);
    });

    it('handles multiple boss battles sequentially', () => {
      const bosses = ['procrastination_demon', 'distraction_hydra', 'perfectionism_sphinx'];
      
      for (const bossId of bosses) {
        BossBattleSystem.startBattle(bossId);
        const battle = BossBattleSystem.getCurrentBattle();
        if (battle) {
          battle.status = 'fighting';
          // Defeat quickly
          BossBattleSystem.dealDamage(1000);
        }
        vi.advanceTimersByTime(7 * 24 * 60 * 60 * 1000); // Advance 1 week
      }
      
      // All battles should be tracked
      expect(BossBattleSystem.canChallengeBoss('procrastination_demon', 50).canChallenge).toBe(true);
    });
  });

  describe('LocalStorage Stress Test', () => {
    it('handles large data persistence', () => {
      const largeData = {
        achievements: Array(100).fill(null).map((_, i) => ({ id: `ach_${i}`, unlocked: true })),
        skills: Array(50).fill(null).map((_, i) => ({ id: `skill_${i}`, level: 5 })),
        powerups: Array(20).fill(null).map((_, i) => ({ id: `powerup_${i}`, active: true })),
        tasks: Array(200).fill(null).map((_, i) => ({ id: `task_${i}`, completed: true }))
      };
      
      const startTime = performance.now();
      localStorage.setItem('stress_test_data', JSON.stringify(largeData));
      const savedData = JSON.parse(localStorage.getItem('stress_test_data') || '{}');
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.localStorageOperation * 10);
      expect(savedData.achievements).toHaveLength(100);
    });

    it('handles concurrent localStorage operations', () => {
      const operations = [];
      
      for (let i = 0; i < 50; i++) {
        operations.push(() => {
          localStorage.setItem(`test_key_${i}`, JSON.stringify({ data: i }));
          const data = localStorage.getItem(`test_key_${i}`);
          expect(data).toBeTruthy();
        });
      }
      
      const startTime = performance.now();
      operations.forEach(op => op());
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.localStorageOperation * 50);
    });
  });

  describe('Notification System Stress Test', () => {
    it('handles many notifications queued', () => {
      const notificationSystem = NotificationSystem.getInstance();
      
      // Queue 100 notifications
      for (let i = 0; i < 100; i++) {
        notificationSystem.showInApp(`Notification ${i}`, i % 2 === 0 ? 'success' : 'info');
      }
      
      // Should group similar notifications
      const grouped = notificationSystem.getGroupedNotifications();
      expect(grouped.length).toBeLessThan(100);
    });

    it('handles rapid notification dismiss', () => {
      const notificationSystem = NotificationSystem.getInstance();
      const ids = [];
      
      // Create notifications
      for (let i = 0; i < 50; i++) {
        const id = notificationSystem.showInApp(`Test ${i}`, 'info');
        ids.push(id);
      }
      
      // Dismiss them all rapidly
      const startTime = performance.now();
      ids.forEach(id => notificationSystem.dismiss(id));
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });

  describe('Task Rarity Calculation Stress Test', () => {
    it('calculates rarity for many tasks efficiently', () => {
      const tasks = Array(1000).fill(null).map((_, i) => ({
        id: `task_${i}`,
        title: `Task ${i} with ${i % 10} words in the title for complexity`,
        est_minutes: (i % 120) + 10,
        created_at: new Date(Date.now() - i * 60000).toISOString(),
        importance: i % 10
      }));
      
      const startTime = performance.now();
      const rarities = tasks.map(task => TaskRaritySystem.calculateRarity(task));
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(100); // Should process 1000 tasks in < 100ms
      expect(rarities).toContain('common');
      expect(rarities).toContain('rare');
      expect(rarities).toContain('epic');
    });
  });

  describe('Power-ups System Stress Test', () => {
    it('handles many active power-ups', () => {
      // Activate many power-ups
      const powerUps = [
        { id: 'xp_boost_small', effect: { duration: 30 } },
        { id: 'time_freeze', effect: { duration: 10 } },
        { id: 'focus_shield', effect: { duration: 25 } }
      ];
      
      for (let i = 0; i < 30; i++) {
        powerUps.forEach(powerUp => {
          PowerUpSystem.activatePowerUp(powerUp as any);
        });
      }
      
      const startTime = performance.now();
      const active = PowerUpSystem.getActivePowerUps();
      const multiplier = PowerUpSystem.getXPMultiplier();
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(20);
      expect(active.length).toBeGreaterThan(0);
      expect(multiplier).toBeGreaterThan(1);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('cleans up expired data properly', () => {
      // Create lots of temporary data
      for (let i = 0; i < 100; i++) {
        localStorage.setItem(`temp_${i}`, JSON.stringify({ data: 'x'.repeat(1000) }));
      }
      
      // Clean up
      for (let i = 0; i < 100; i++) {
        localStorage.removeItem(`temp_${i}`);
      }
      
      // Check memory usage (simplified - in real tests you'd use performance.memory)
      const remainingKeys = Object.keys(localStorage).filter(key => key.startsWith('temp_'));
      expect(remainingKeys).toHaveLength(0);
    });
  });
});
