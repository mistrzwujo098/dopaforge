'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@dopaforge/ui';
import { useRouter } from 'next/navigation';

interface MobileMenuProps {
  isScrolled?: boolean;
}

export function MobileMenu({ isScrolled = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { label: 'Jak to działa', href: '#how-it-works' },
    { label: 'Funkcje', href: '#features' },
    { label: 'Opinie', href: '#testimonials' },
    { label: 'Cennik', href: '#pricing' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(href);
    }
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 ${
                isScrolled 
                  ? 'bg-white/95 dark:bg-gray-900/95' 
                  : 'bg-white dark:bg-gray-900'
              } backdrop-blur-xl shadow-2xl`}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-lg font-semibold">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Zamknij menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6">
                  <ul className="space-y-1 px-4">
                    {menuItems.map((item, index) => (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => handleNavClick(item.href)}
                          className="w-full text-left px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          {item.label}
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* CTA Buttons */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <Button
                    onClick={() => {
                      router.push('/auth');
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
                    size="lg"
                  >
                    Rozpocznij za darmo
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/auth');
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Zaloguj się
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}