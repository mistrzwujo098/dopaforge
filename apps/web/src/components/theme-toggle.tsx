'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@dopaforge/ui';
import { useDarkMode } from '@/hooks/useDarkMode';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  const icons = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
  };

  const Icon = icons[theme];

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative p-2 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}