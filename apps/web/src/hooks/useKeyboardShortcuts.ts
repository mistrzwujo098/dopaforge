'use client';

import { useEffect, useCallback, useState } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Special case: Escape key should work everywhere
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Check for help shortcut
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        setShowHelp(!showHelp);
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrlKey || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatch = !shortcut.shiftKey || event.shiftKey === shortcut.shiftKey;
        const altMatch = !shortcut.altKey || event.altKey === shortcut.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    },
    [shortcuts, showHelp]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return { showHelp, setShowHelp };
}

// Global shortcuts hook
export function useGlobalShortcuts() {
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load custom shortcuts from localStorage
    const saved = localStorage.getItem('customShortcuts');
    if (saved) {
      setCustomShortcuts(JSON.parse(saved));
    }
  }, []);

  const saveCustomShortcut = (action: string, key: string) => {
    const updated = { ...customShortcuts, [action]: key };
    setCustomShortcuts(updated);
    localStorage.setItem('customShortcuts', JSON.stringify(updated));
  };

  return { customShortcuts, saveCustomShortcut };
}