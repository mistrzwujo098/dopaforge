'use client';

import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { getUserProfile, updateUserProfile } from '@/lib/db-client';

export type Theme = 'light' | 'dark' | 'auto';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('auto');
  const [isDark, setIsDark] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    // Pobierz motyw z bazy danych dla zalogowanego użytkownika
    const loadTheme = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          if (profile && (profile as any).theme) {
            setTheme((profile as any).theme);
            return;
          }
        } catch (error) {
          console.error('Failed to load theme from database:', error);
        }
      }
      
      // Fallback na localStorage dla niezalogowanych użytkowników
      const savedTheme = localStorage.getItem('theme') as Theme || 'auto';
      setTheme(savedTheme);
    };
    
    loadTheme();
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Check system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        const shouldBeDark = e.matches;
        setIsDark(shouldBeDark);
        
        // Smooth transition
        root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        if (shouldBeDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      // Initial check
      updateTheme(mediaQuery);

      // Listen for changes
      mediaQuery.addEventListener('change', updateTheme);
      
      // Auto-switch based on time
      const checkTime = () => {
        const hour = new Date().getHours();
        const isNightTime = hour < 6 || hour >= 20; // 8 PM to 6 AM
        
        if (isNightTime && !root.classList.contains('dark')) {
          root.classList.add('dark');
          setIsDark(true);
        } else if (!isNightTime && root.classList.contains('dark') && !mediaQuery.matches) {
          root.classList.remove('dark');
          setIsDark(false);
        }
      };

      // Check every minute
      const interval = setInterval(checkTime, 60000);
      checkTime(); // Initial check

      return () => {
        mediaQuery.removeEventListener('change', updateTheme);
        clearInterval(interval);
      };
    } else {
      // Manual theme
      root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      
      if (theme === 'dark') {
        root.classList.add('dark');
        setIsDark(true);
      } else {
        root.classList.remove('dark');
        setIsDark(false);
      }
    }
  }, [theme]);

  const setThemeAndSave = async (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Zapisz w bazie danych dla zalogowanych użytkowników
    if (user) {
      try {
        await updateUserProfile(user.id, { theme: newTheme } as any);
      } catch (error) {
        console.error('Failed to save theme to database:', error);
      }
    } else {
      // Fallback na localStorage dla niezalogowanych
      localStorage.setItem('theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeAndSave(themes[nextIndex]);
  };

  return {
    theme,
    isDark,
    setTheme: setThemeAndSave,
    toggleTheme,
  };
}