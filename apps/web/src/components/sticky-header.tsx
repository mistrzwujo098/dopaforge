'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface StickyHeaderProps {
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function StickyHeader({ 
  children, 
  threshold = 50,
  className = '' 
}: StickyHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, threshold], [1, 0.98]);
  const headerBlur = useTransform(scrollY, [0, threshold], [0, 10]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return (
    <motion.header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isSticky
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm'
          : 'bg-white dark:bg-gray-900'
      } ${className}`}
      style={{
        opacity: headerOpacity,
        backdropFilter: `blur(${headerBlur}px)`
      }}
    >
      <div className="relative">
        {children}
        
        {/* Bottom gradient for smooth transition */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent transition-opacity duration-300 ${
            isSticky ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </motion.header>
  );
}

// Contextual Actions Bar
interface ContextualActionsProps {
  visible: boolean;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

export function ContextualActions({ visible, actions }: ContextualActionsProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: visible ? 'auto' : 0,
        opacity: visible ? 1 : 0
      }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2 p-4 border-t dark:border-gray-800">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={action.onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              action.variant === 'primary'
                ? 'bg-primary text-white hover:bg-primary/90'
                : action.variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              {action.icon}
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// Smooth Reveal Animation
export function SmoothReveal({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : -20,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}