import { updateUserProfile } from './db-client';

/**
 * Migruje dane z localStorage do bazy danych
 * Uruchamiane jednorazowo dla każdego użytkownika
 */
export async function migrateUserDataFromLocalStorage(userId: string) {
  try {
    const updates: any = {};
    
    // Migruj preferencje motywu
    const theme = localStorage.getItem('theme');
    if (theme && ['auto', 'light', 'dark'].includes(theme)) {
      updates.theme = theme;
    }
    
    // Migruj ustawienia dźwięku
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled !== null) {
      updates.sound_enabled = soundEnabled !== 'false';
    }
    
    const soundVolume = localStorage.getItem('soundVolume');
    if (soundVolume !== null) {
      const volume = parseFloat(soundVolume);
      if (!isNaN(volume) && volume >= 0 && volume <= 1) {
        updates.sound_volume = volume;
      }
    }
    
    // Migruj niestandardowe skróty klawiaturowe
    const customShortcuts = localStorage.getItem('customShortcuts');
    if (customShortcuts) {
      try {
        updates.keyboard_shortcuts = JSON.parse(customShortcuts);
      } catch (e) {
        console.error('Failed to parse custom shortcuts:', e);
      }
    }
    
    // Migruj odrzucone podpowiedzi
    const dismissedHints = localStorage.getItem('dismissedHints');
    if (dismissedHints) {
      try {
        updates.dismissed_hints = JSON.parse(dismissedHints);
      } catch (e) {
        console.error('Failed to parse dismissed hints:', e);
      }
    }
    
    // Migruj stan codziennych nagród
    const dailyRewardsKey = `daily_rewards_${userId}`;
    const dailyRewards = localStorage.getItem(dailyRewardsKey);
    if (dailyRewards) {
      try {
        updates.daily_rewards_state = JSON.parse(dailyRewards);
      } catch (e) {
        console.error('Failed to parse daily rewards:', e);
      }
    }
    
    // Migruj ostatnie logowanie
    const lastLoginKey = `last_login_${userId}`;
    const lastLogin = localStorage.getItem(lastLoginKey);
    if (lastLogin) {
      updates.last_daily_login = lastLogin;
    }
    
    // Migruj osiągnięcia
    const achievementsKey = `achievements_${userId}`;
    const achievements = localStorage.getItem(achievementsKey);
    if (achievements) {
      try {
        updates.achievements = JSON.parse(achievements);
      } catch (e) {
        console.error('Failed to parse achievements:', e);
      }
    }
    
    // Migruj postęp drzewka umiejętności
    const skillTreeProgress = localStorage.getItem('skill_tree_progress');
    if (skillTreeProgress) {
      try {
        updates.skill_tree_progress = JSON.parse(skillTreeProgress);
      } catch (e) {
        console.error('Failed to parse skill tree progress:', e);
      }
    }
    
    // Migruj aktywne power-upy
    const activePowerups = localStorage.getItem('active_powerups');
    if (activePowerups) {
      try {
        updates.active_powerups = JSON.parse(activePowerups);
      } catch (e) {
        console.error('Failed to parse active powerups:', e);
      }
    }
    
    // Migruj stan walk z bossami
    const currentBossBattle = localStorage.getItem('current_boss_battle');
    const defeatedBosses = localStorage.getItem('defeated_bosses');
    const bossBattlesState: any = {};
    
    if (currentBossBattle) {
      try {
        bossBattlesState.current_battle = JSON.parse(currentBossBattle);
      } catch (e) {
        console.error('Failed to parse current boss battle:', e);
      }
    }
    
    if (defeatedBosses) {
      try {
        bossBattlesState.defeated_bosses = JSON.parse(defeatedBosses);
      } catch (e) {
        console.error('Failed to parse defeated bosses:', e);
      }
    }
    
    if (Object.keys(bossBattlesState).length > 0) {
      updates.boss_battles_state = bossBattlesState;
    }
    
    // Zapisz wszystkie aktualizacje do bazy danych
    if (Object.keys(updates).length > 0) {
      await updateUserProfile(userId, updates);
      
      // Po udanej migracji, usuń dane z localStorage
      localStorage.removeItem('theme');
      localStorage.removeItem('soundEnabled');
      localStorage.removeItem('soundVolume');
      localStorage.removeItem('customShortcuts');
      localStorage.removeItem('dismissedHints');
      localStorage.removeItem(dailyRewardsKey);
      localStorage.removeItem(lastLoginKey);
      localStorage.removeItem(achievementsKey);
      localStorage.removeItem('skill_tree_progress');
      localStorage.removeItem('active_powerups');
      localStorage.removeItem('current_boss_battle');
      localStorage.removeItem('defeated_bosses');
      
      // Ustaw flagę, że migracja została wykonana
      localStorage.setItem('data_migrated_to_db', 'true');
      
      console.log('Successfully migrated user data to database');
    }
  } catch (error) {
    console.error('Failed to migrate user data:', error);
    // Nie blokuj aplikacji jeśli migracja się nie uda
  }
}

/**
 * Sprawdza czy dane użytkownika zostały już zmigrowane
 */
export function isDataMigrated(): boolean {
  return localStorage.getItem('data_migrated_to_db') === 'true';
}