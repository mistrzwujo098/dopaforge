import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BossBattleSystem, BOSSES } from '../boss-battles';

describe('BossBattleSystem', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset static properties by accessing them via the class
    (BossBattleSystem as any).currentBattle = null;
    (BossBattleSystem as any).defeatedBosses = new Map();
    BossBattleSystem.loadBattleState();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-27T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Boss Challenge Eligibility', () => {
    it('can challenge boss with sufficient level', () => {
      const result = BossBattleSystem.canChallengeBoss('procrastination_demon', 15);
      expect(result.canChallenge).toBe(true);
    });

    it('cannot challenge boss with insufficient level', () => {
      const result = BossBattleSystem.canChallengeBoss('procrastination_demon', 5);
      expect(result.canChallenge).toBe(false);
      expect(result.reason).toContain('Wymagany poziom');
    });

    it('cannot challenge non-existent boss', () => {
      const result = BossBattleSystem.canChallengeBoss('fake_boss', 50);
      expect(result.canChallenge).toBe(false);
      expect(result.reason).toBe('Boss nie istnieje');
    });

    it('cannot challenge boss on cooldown', () => {
      // Start and defeat a boss
      const battle = BossBattleSystem.startBattle('procrastination_demon');
      expect(battle).not.toBeNull();
      
      // Set to fighting status
      if (battle) {
        (BossBattleSystem as any).currentBattle.status = 'fighting';
      }
      
      // Simulate defeating the boss - need to deal enough damage to kill it
      // Procrastination demon has 100 health total
      const defeatResult = BossBattleSystem.dealDamage(200);
      expect(defeatResult.battleWon).toBe(true);
      
      // Try to challenge again immediately
      const result = BossBattleSystem.canChallengeBoss('procrastination_demon', 15);
      expect(result.canChallenge).toBe(false);
      expect(result.reason).toContain('Cooldown');
    });

    it('can challenge boss after cooldown expires', () => {
      // Defeat boss
      BossBattleSystem.startBattle('procrastination_demon');
      (BossBattleSystem as any).currentBattle.status = 'fighting';
      BossBattleSystem.dealDamage(200); // Defeat it
      
      // Advance time past cooldown (24 hours)
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      
      const result = BossBattleSystem.canChallengeBoss('procrastination_demon', 15);
      expect(result.canChallenge).toBe(true);
    });
  });

  describe('Battle Management', () => {
    it('starts battle correctly', () => {
      const battle = BossBattleSystem.startBattle('procrastination_demon');
      expect(battle).not.toBeNull();
      expect(battle?.bossId).toBe('procrastination_demon');
      expect(battle?.currentHealth).toBe(100);
      expect(battle?.currentPhase).toBe(0);
      expect(battle?.status).toBe('preparing');
    });

    it('tracks battle attempts', () => {
      const battle1 = BossBattleSystem.startBattle('procrastination_demon');
      expect(battle1?.attempts).toBe(1);
      
      BossBattleSystem.forfeitBattle();
      
      const battle2 = BossBattleSystem.startBattle('procrastination_demon');
      expect(battle2?.attempts).toBe(2);
    });

    it('cannot start battle while another is active', () => {
      BossBattleSystem.startBattle('procrastination_demon');
      const currentBattle = BossBattleSystem.getCurrentBattle();
      if (currentBattle) currentBattle.status = 'fighting';
      
      const result = BossBattleSystem.canChallengeBoss('distraction_hydra', 25);
      expect(result.canChallenge).toBe(false);
      expect(result.reason).toBe('Już walczysz z bossem');
    });
  });

  describe('Damage Calculation', () => {
    beforeEach(() => {
      const battle = BossBattleSystem.startBattle('procrastination_demon');
      if (battle) battle.status = 'fighting';
    });

    it('deals base damage', () => {
      const result = BossBattleSystem.dealDamage(20);
      expect(result.damageDealt).toBe(20);
      
      const battle = BossBattleSystem.getCurrentBattle();
      expect(battle?.currentHealth).toBe(80);
    });

    it('applies damage multipliers', () => {
      const result = BossBattleSystem.dealDamage(10, {
        completedInTime: true, // 1.2x
        maintainedStreak: true, // 1.5x
        perfectAccuracy: true // 2x
      });
      // 10 * 1.2 * 1.5 * 2 = 36
      expect(result.damageDealt).toBe(36);
    });

    it('tracks phase completion', () => {
      BossBattleSystem.startBattle('procrastination_demon');
      (BossBattleSystem as any).currentBattle.status = 'fighting';
      
      // Procrastination demon has 100 total health, phase 1 is at 100 health
      // Phase 1 completes immediately because phaseHealthThreshold = 100 - 100 = 0
      // So any damage will complete phase 1
      const result1 = BossBattleSystem.dealDamage(30);
      expect(result1.phaseComplete).toBe(true);
      
      // Now we're in phase 2, which has 50 health threshold
      // We need to deal total damage > 50 to complete phase 2
      const result2 = BossBattleSystem.dealDamage(25);
      expect(result2.phaseComplete).toBe(true); // Total damage is 55, which > 50
      
      // Deal final damage to win
      const result3 = BossBattleSystem.dealDamage(50);
      expect(result3.battleWon).toBe(true);
      
      const battle = BossBattleSystem.getCurrentBattle();
      expect(battle?.status).toBe('victory');
    });

    it('completes battle when health reaches 0', () => {
      const result = BossBattleSystem.dealDamage(100);
      expect(result.battleWon).toBe(true);
      expect(result.rewards).toBeDefined();
      
      const battle = BossBattleSystem.getCurrentBattle();
      expect(battle?.status).toBe('victory');
    });
  });

  describe('Mechanic Violations', () => {
    beforeEach(() => {
      const battle = BossBattleSystem.startBattle('procrastination_demon');
      if (battle) battle.status = 'fighting';
    });

    it('detects time limit violations', () => {
      const violated = BossBattleSystem.checkMechanicViolation('time_limit', 35);
      expect(violated).toBe(true); // Phase 1 has 30 min limit
    });

    it('detects streak requirement violations', () => {
      // Move to phase 2
      BossBattleSystem.dealDamage(60);
      
      const violated = BossBattleSystem.checkMechanicViolation('streak_requirement', 2);
      expect(violated).toBe(true); // Phase 2 requires 3 streak
    });

    it('returns false for non-existent mechanics', () => {
      const violated = BossBattleSystem.checkMechanicViolation('fake_mechanic', 100);
      expect(violated).toBe(false);
    });
  });

  describe('Rewards Calculation', () => {
    it('calculates normal difficulty rewards', () => {
      // Reset defeated bosses to ensure first time bonus
      (BossBattleSystem as any).defeatedBosses.clear();
      
      BossBattleSystem.startBattle('procrastination_demon');
      const battle = BossBattleSystem.getCurrentBattle();
      if (battle) battle.status = 'fighting';
      
      // Defeat the boss entirely (100 health)
      const result = BossBattleSystem.dealDamage(200);
      expect(result.battleWon).toBe(true);
      expect(result.rewards.totalXP).toBe(600); // 300 base * 2 for first time
      expect(result.rewards.totalPoints).toBe(300); // 150 base * 2 for first time
    });

    it('applies difficulty multipliers', () => {
      // Test with a legendary boss
      const sphinx = BOSSES.find(b => b.id === 'perfectionism_sphinx');
      expect(sphinx?.difficulty).toBe('legendary');
      
      BossBattleSystem.startBattle('perfectionism_sphinx');
      const battle = BossBattleSystem.getCurrentBattle();
      if (battle) {
        battle.status = 'fighting';
        battle.currentHealth = 1; // Almost defeated
      }
      
      const result = BossBattleSystem.dealDamage(1);
      expect(result.rewards.totalXP).toBeGreaterThan(1000); // Higher for legendary
    });

    it('includes special rewards', () => {
      BossBattleSystem.startBattle('distraction_hydra');
      const battle = BossBattleSystem.getCurrentBattle();
      if (battle) {
        battle.status = 'fighting';
        battle.currentHealth = 1;
      }
      
      const result = BossBattleSystem.dealDamage(1);
      expect(result.rewards.items).toContain('2x XP Boost');
      expect(result.rewards.achievements).toContain('hydra_slayer');
    });
  });

  describe('Battle Persistence', () => {
    it('saves and loads battle state', () => {
      const battle = BossBattleSystem.startBattle('procrastination_demon');
      if (battle) {
        battle.status = 'fighting';
        BossBattleSystem.dealDamage(30);
      }
      
      // Simulate reload
      BossBattleSystem.loadBattleState();
      
      const loadedBattle = BossBattleSystem.getCurrentBattle();
      expect(loadedBattle?.bossId).toBe('procrastination_demon');
      expect(loadedBattle?.currentHealth).toBe(70);
      expect(loadedBattle?.status).toBe('fighting');
    });

    it('tracks defeated bosses', () => {
      // Defeat two bosses
      BossBattleSystem.startBattle('procrastination_demon');
      (BossBattleSystem as any).currentBattle.status = 'fighting';
      BossBattleSystem.dealDamage(200); // Kill it entirely
      
      vi.advanceTimersByTime(25 * 60 * 60 * 1000); // Advance past cooldown
      
      BossBattleSystem.startBattle('distraction_hydra');
      (BossBattleSystem as any).currentBattle.status = 'fighting';
      BossBattleSystem.dealDamage(400); // Kill hydra entirely (200 health)
      
      // Reload and check
      BossBattleSystem.loadBattleState();
      
      // Procrastination demon cooldown passed (24h < 25h)
      const demon = BossBattleSystem.canChallengeBoss('procrastination_demon', 50);
      // Hydra still on cooldown (48h > 25h)
      const hydra = BossBattleSystem.canChallengeBoss('distraction_hydra', 50);
      
      expect(demon.canChallenge).toBe(true); // Cooldown passed
      expect(hydra.canChallenge).toBe(false); // Still on cooldown
    });
  });

  describe('Forfeit Functionality', () => {
    it('can forfeit active battle', () => {
      BossBattleSystem.startBattle('procrastination_demon');
      const battle = BossBattleSystem.getCurrentBattle();
      if (battle) battle.status = 'fighting';
      
      BossBattleSystem.forfeitBattle();
      
      const afterForfeit = BossBattleSystem.getCurrentBattle();
      expect(afterForfeit?.status).toBe('defeat');
    });
  });
});
