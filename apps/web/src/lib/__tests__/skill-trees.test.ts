import { describe, it, expect, beforeEach } from 'vitest';
import { SkillTreeSystem, SKILL_TREES } from '../skill-trees';

describe('SkillTreeSystem', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset static properties
    (SkillTreeSystem as any).unlockedSkills = new Map();
    (SkillTreeSystem as any).skillPoints = 0;
    // Reset the static class state
    SkillTreeSystem.loadProgress();
  });

  describe('Skill Points Management', () => {
    it('starts with 0 skill points', () => {
      expect(SkillTreeSystem.getSkillPoints()).toBe(0);
    });

    it('can add skill points', () => {
      SkillTreeSystem.addSkillPoints(100);
      expect(SkillTreeSystem.getSkillPoints()).toBe(100);
    });

    it('persists skill points to localStorage', () => {
      SkillTreeSystem.addSkillPoints(250);
      
      // Create new instance and load
      SkillTreeSystem.loadProgress();
      expect(SkillTreeSystem.getSkillPoints()).toBe(250);
    });
  });

  describe('Skill Unlocking', () => {
    beforeEach(() => {
      SkillTreeSystem.addSkillPoints(500);
    });

    it('can unlock a skill with sufficient points and level', () => {
      const result = SkillTreeSystem.canUnlockSkill('time_mastery', 'productivity', 10);
      expect(result.canUnlock).toBe(true);
    });

    it('cannot unlock skill without sufficient points', () => {
      SkillTreeSystem.addSkillPoints(-400); // Leave only 100 points
      const result = SkillTreeSystem.canUnlockSkill('deep_focus', 'productivity', 20);
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('punktów');
    });

    it('cannot unlock skill without sufficient level', () => {
      const result = SkillTreeSystem.canUnlockSkill('deep_focus', 'productivity', 10);
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('Wymagany poziom');
    });

    it('cannot unlock skill without prerequisites', () => {
      const result = SkillTreeSystem.canUnlockSkill('multitasking', 'productivity', 25);
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('Wymagane');
    });

    it('can unlock skill with prerequisites met', () => {
      // Unlock prerequisites
      SkillTreeSystem.unlockSkill('time_mastery', 'productivity');
      SkillTreeSystem.unlockSkill('time_mastery', 'productivity');
      SkillTreeSystem.unlockSkill('time_mastery', 'productivity');
      SkillTreeSystem.unlockSkill('quick_start', 'productivity');
      SkillTreeSystem.unlockSkill('quick_start', 'productivity');
      SkillTreeSystem.unlockSkill('deep_focus', 'productivity');
      SkillTreeSystem.unlockSkill('deep_focus', 'productivity');
      
      SkillTreeSystem.addSkillPoints(1000);
      const result = SkillTreeSystem.canUnlockSkill('multitasking', 'productivity', 25);
      expect(result.canUnlock).toBe(true);
    });

    it('respects max level limits', () => {
      // Max out time_mastery (5 levels)
      for (let i = 0; i < 5; i++) {
        SkillTreeSystem.unlockSkill('time_mastery', 'productivity');
      }
      
      SkillTreeSystem.addSkillPoints(1000);
      const result = SkillTreeSystem.canUnlockSkill('time_mastery', 'productivity', 10);
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('Maksymalny poziom');
    });
  });

  describe('Skill Level Tracking', () => {
    it('tracks skill levels correctly', () => {
      expect(SkillTreeSystem.getSkillLevel('xp_boost', 'gamification')).toBe(0);
      
      SkillTreeSystem.addSkillPoints(200);
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      expect(SkillTreeSystem.getSkillLevel('xp_boost', 'gamification')).toBe(1);
      
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      expect(SkillTreeSystem.getSkillLevel('xp_boost', 'gamification')).toBe(2);
    });
  });

  describe('Tree Progress', () => {
    it('calculates tree progress correctly', () => {
      const initialProgress = SkillTreeSystem.getTreeProgress('productivity');
      expect(initialProgress.unlockedNodes).toBe(0);
      expect(initialProgress.percentage).toBe(0);
      
      SkillTreeSystem.addSkillPoints(500);
      SkillTreeSystem.unlockSkill('time_mastery', 'productivity');
      
      const progress = SkillTreeSystem.getTreeProgress('productivity');
      expect(progress.unlockedNodes).toBe(1);
      expect(progress.totalNodes).toBe(5);
      expect(progress.percentage).toBeGreaterThan(0);
    });
  });

  describe('Active Effects', () => {
    it('calculates active effects correctly', () => {
      const initialEffects = SkillTreeSystem.getActiveEffects();
      expect(initialEffects.size).toBe(0);
      
      SkillTreeSystem.addSkillPoints(500);
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      
      const effects = SkillTreeSystem.getActiveEffects();
      expect(effects.get('xp_gain')).toBe(10); // 5 + 5
    });

    it('stacks effects from multiple skills', () => {
      SkillTreeSystem.addSkillPoints(1000);
      
      // Unlock multiple skills with same effect type
      SkillTreeSystem.unlockSkill('willpower', 'resilience');
      SkillTreeSystem.unlockSkill('willpower', 'resilience');
      
      const effects = SkillTreeSystem.getActiveEffects();
      expect(effects.get('procrastination_resistance')).toBe(10); // 5 + 5
    });
  });

  describe('Tree Reset', () => {
    it('resets tree and refunds 80% of points', () => {
      SkillTreeSystem.addSkillPoints(500);
      
      // Spend 250 points
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification'); // 50
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification'); // 50
      SkillTreeSystem.unlockSkill('lucky_drops', 'gamification'); // 100
      SkillTreeSystem.unlockSkill('combo_master', 'gamification'); // 150
      
      expect(SkillTreeSystem.getSkillPoints()).toBe(150); // 500 - 350
      
      const refunded = SkillTreeSystem.resetTree('gamification');
      expect(refunded).toBe(280); // 80% of 350
      expect(SkillTreeSystem.getSkillPoints()).toBe(430); // 150 + 280
      
      // All skills should be reset
      expect(SkillTreeSystem.getSkillLevel('xp_boost', 'gamification')).toBe(0);
      expect(SkillTreeSystem.getSkillLevel('lucky_drops', 'gamification')).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('saves and loads complete state', () => {
      SkillTreeSystem.addSkillPoints(1000);
      SkillTreeSystem.unlockSkill('time_mastery', 'productivity');
      SkillTreeSystem.unlockSkill('xp_boost', 'gamification');
      SkillTreeSystem.unlockSkill('willpower', 'resilience');
      
      const pointsBefore = SkillTreeSystem.getSkillPoints();
      const level1Before = SkillTreeSystem.getSkillLevel('time_mastery', 'productivity');
      const level2Before = SkillTreeSystem.getSkillLevel('xp_boost', 'gamification');
      const level3Before = SkillTreeSystem.getSkillLevel('willpower', 'resilience');
      
      // Simulate reload
      SkillTreeSystem.loadProgress();
      
      expect(SkillTreeSystem.getSkillPoints()).toBe(pointsBefore);
      expect(SkillTreeSystem.getSkillLevel('time_mastery', 'productivity')).toBe(level1Before);
      expect(SkillTreeSystem.getSkillLevel('xp_boost', 'gamification')).toBe(level2Before);
      expect(SkillTreeSystem.getSkillLevel('willpower', 'resilience')).toBe(level3Before);
    });
  });
});
