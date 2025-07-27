'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Command } from 'lucide-react';
import { Button } from '@dopaforge/ui';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts: Shortcut[] = [
  // Task Management
  { key: 'Ctrl+N', description: 'Nowe zadanie', category: 'Zadania' },
  { key: 'Space', description: 'Start/Stop zadania', category: 'Zadania' },
  { key: '1-9', description: 'Wybierz zadanie', category: 'Zadania' },
  { key: 'Enter', description: 'Rozpocznij wybrane zadanie', category: 'Zadania' },
  { key: 'Delete', description: 'Usuń zadanie', category: 'Zadania' },
  
  // Navigation
  { key: '↑/↓', description: 'Nawiguj między zadaniami', category: 'Nawigacja' },
  { key: 'Tab', description: 'Następny element', category: 'Nawigacja' },
  { key: 'Shift+Tab', description: 'Poprzedni element', category: 'Nawigacja' },
  { key: 'Escape', description: 'Anuluj/Zamknij', category: 'Nawigacja' },
  
  // Focus Mode
  { key: 'F', description: 'Tryb skupienia', category: 'Skupienie' },
  { key: 'P', description: 'Pauza/Wznów', category: 'Skupienie' },
  { key: 'R', description: 'Reset timera', category: 'Skupienie' },
  
  // System
  { key: 'Ctrl+/', description: 'Pokaż skróty', category: 'System' },
  { key: 'Ctrl+S', description: 'Zapisz postęp', category: 'System' },
  { key: 'Ctrl+Z', description: 'Cofnij', category: 'System' },
  { key: 'Ctrl+Shift+Z', description: 'Ponów', category: 'System' },
];

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const categories = [...new Set(shortcuts.map(s => s.category))];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-50 max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Command className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Skróty klawiszowe</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <kbd className="px-3 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-muted-foreground text-center">
                Wskazówka: Możesz dostosować skróty w ustawieniach
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}