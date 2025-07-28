'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Settings, 
  BarChart3, 
  BookOpen, 
  Menu, 
  X,
  Zap,
  Trophy,
  Brain,
  Heart,
  Calendar,
  HelpCircle,
  LogOut,
  ChevronRight,
  Lock
} from 'lucide-react';
import { cn } from '@dopaforge/ui';
import { useUser } from '@/hooks/useUser';
import { getUserProfile } from '@/lib/db-client';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  requiredLevel?: number;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Zadania',
    icon: Home,
    href: '/dashboard',
    description: 'Twoje dzisiejsze mikro-zadania'
  },
  {
    id: 'stats',
    label: 'Statystyki',
    icon: BarChart3,
    href: '/stats',
    badge: 'Nowe',
    description: 'Twoje postępy i osiągnięcia'
  },
  {
    id: 'future-self',
    label: 'Przyszłe Ja',
    icon: Brain,
    href: '/future-self',
    requiredLevel: 5,
    description: 'Wizualizacja celów'
  },
  {
    id: 'habits',
    label: 'Nawyki',
    icon: Heart,
    href: '/habits',
    requiredLevel: 10,
    description: 'Intencje i kontrakty'
  },
  {
    id: 'calendar',
    label: 'Kalendarz',
    icon: Calendar,
    href: '/calendar',
    requiredLevel: 15,
    description: 'Planowanie długoterminowe'
  },
  {
    id: 'docs',
    label: 'Przewodnik',
    icon: BookOpen,
    href: '/docs',
    description: 'Jak pokonać prokrastynację'
  },
  {
    id: 'settings',
    label: 'Ustawienia',
    icon: Settings,
    href: '/settings',
    description: 'Personalizacja aplikacji'
  }
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserLevel();
    }
  }, [user]);

  const loadUserLevel = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        const level = Math.floor((profile.total_xp || 0) / 100) + 1;
        setUserLevel(level);
      }
    } catch (error) {
      console.error('Error loading user level:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isItemLocked = (item: NavItem) => {
    return !!(item.requiredLevel && userLevel < item.requiredLevel);
  };

  const handleNavClick = (item: NavItem) => {
    if (isItemLocked(item)) {
      // Pokaż komunikat o odblokowaniu
      return;
    }
    
    router.push(item.href);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-xl",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg",
          "border border-gray-200 dark:border-gray-800",
          "shadow-lg md:hidden",
          "hover:scale-105 active:scale-95 transition-all"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
            className={cn(
              "fixed left-0 top-0 h-full w-72 z-40",
              "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
              "border-r border-gray-200 dark:border-gray-800",
              "shadow-2xl",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl blur-lg opacity-70" />
                  <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl p-2">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    DopaForge
                  </h1>
                  <p className="text-xs text-muted-foreground">Poziom {userLevel}</p>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {navigationItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  const isLocked = isItemLocked(item);
                  const Icon = item.icon;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                      onClick={() => handleNavClick(item)}
                      disabled={isLocked}
                      className={cn(
                        "w-full group relative",
                        "flex items-center gap-3 px-4 py-3 rounded-xl",
                        "transition-all duration-200",
                        isActive && "bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30",
                        !isActive && !isLocked && "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                        isLocked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-r-full"
                        />
                      )}

                      {/* Icon */}
                      <div className={cn(
                        "relative transition-all duration-200",
                        isActive && "text-emerald-600 dark:text-emerald-400",
                        !isActive && !isLocked && "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200",
                        isLocked && "text-gray-400 dark:text-gray-600"
                      )}>
                        {isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium transition-colors",
                          isActive && "text-gray-900 dark:text-white",
                          !isActive && !isLocked && "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white",
                          isLocked && "text-gray-500 dark:text-gray-600"
                        )}>
                          {item.label}
                        </div>
                        {isLocked && (
                          <div className="text-xs text-gray-400 dark:text-gray-600">
                            Poziom {item.requiredLevel}
                          </div>
                        )}
                      </div>

                      {/* Badge or arrow */}
                      {item.badge && !isLocked && (
                        <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      
                      {!isLocked && (
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-all duration-200",
                          "text-gray-400 dark:text-gray-600",
                          "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        )} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                  "transition-all duration-200"
                )}
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Wyloguj</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Help button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className={cn(
          "fixed bottom-4 right-4 z-30",
          "p-3 rounded-full",
          "bg-gradient-to-br from-emerald-500 to-cyan-500",
          "text-white shadow-lg",
          "hover:scale-110 active:scale-95 transition-all",
          "hover:shadow-emerald-500/25"
        )}
        onClick={() => router.push('/help')}
      >
        <HelpCircle className="h-5 w-5" />
      </motion.button>
    </>
  );
}