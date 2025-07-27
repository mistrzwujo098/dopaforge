'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('auto');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme || 'auto';
    setTheme(savedTheme);
  }, []);

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

  const setThemeAndSave = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
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