'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@dopaforge/ui';
import { X, Sparkles, ChevronRight, Lock } from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  route: string;
  category: 'core' | 'advanced' | 'experimental';
  icon?: React.ReactNode;
}

interface ProgressiveDiscoveryProps {
  userLevel: number;
  onFeatureClick?: (feature: Feature) => void;
}

const features: Feature[] = [
  {
    id: 'stats',
    name: 'Statystyki',
    description: 'Odkryj swoje wzorce produktywności i śledź postępy',
    requiredLevel: 1,
    route: '/stats',
    category: 'core'
  },
  {
    id: 'future-self',
    name: 'Przyszłe Ja',
    description: 'Wizualizuj swoje cele i motywuj się długoterminowo',
    requiredLevel: 5,
    route: '/future-self',
    category: 'advanced'
  },
  {
    id: 'habits',
    name: 'System Nawyków',
    description: 'Twórz intencje implementacyjne i kontrakty zobowiązań',
    requiredLevel: 10,
    route: '/habits',
    category: 'advanced'
  },
  {
    id: 'calendar',
    name: 'Kalendarz',
    description: 'Planuj długoterminowo i synchronizuj z celami',
    requiredLevel: 15,
    route: '/calendar',
    category: 'advanced'
  },
  {
    id: 'ai-coach',
    name: 'AI Coach',
    description: 'Osobisty trener produktywności napędzany AI',
    requiredLevel: 20,
    route: '/ai-coach',
    category: 'experimental'
  },
  {
    id: 'team-challenges',
    name: 'Wyzwania Zespołowe',
    description: 'Rywalizuj z przyjaciółmi i motywujcie się nawzajem',
    requiredLevel: 25,
    route: '/team',
    category: 'experimental'
  }
];

export function ProgressiveDiscovery({ userLevel, onFeatureClick }: ProgressiveDiscoveryProps) {
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [dismissedFeatures, setDismissedFeatures] = useState<string[]>([]);
  const [highlightedFeature, setHighlightedFeature] = useState<Feature | null>(null);

  useEffect(() => {
    // Load dismissed features from localStorage
    const dismissed = localStorage.getItem('dismissedFeatures');
    if (dismissed) {
      setDismissedFeatures(JSON.parse(dismissed));
    }

    // Check for newly unlocked features
    checkNewFeatures();
  }, [userLevel]);

  const checkNewFeatures = () => {
    const unlockedFeatures = features.filter(f => 
      userLevel >= f.requiredLevel && 
      !dismissedFeatures.includes(f.id)
    );

    const newlyUnlocked = unlockedFeatures.find(f => 
      userLevel === f.requiredLevel || 
      (userLevel > f.requiredLevel && userLevel <= f.requiredLevel + 2)
    );

    if (newlyUnlocked) {
      setHighlightedFeature(newlyUnlocked);
      setShowDiscovery(true);
    }
  };

  const dismissFeature = (featureId: string) => {
    const newDismissed = [...dismissedFeatures, featureId];
    setDismissedFeatures(newDismissed);
    localStorage.setItem('dismissedFeatures', JSON.stringify(newDismissed));
    setShowDiscovery(false);
    setHighlightedFeature(null);
  };

  const getNextFeature = () => {
    return features.find(f => userLevel < f.requiredLevel);
  };

  const nextFeature = getNextFeature();
  const progressToNext = nextFeature 
    ? ((userLevel % 5) / 5) * 100 
    : 100;

  return (
    <>
      {/* Feature Unlock Notification */}
      <AnimatePresence>
        {showDiscovery && highlightedFeature && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-20 right-4 z-50 max-w-sm"
          >
            <Card className="p-6 shadow-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Nowa funkcja odblokowana!</h3>
                </div>
                <button
                  onClick={() => dismissFeature(highlightedFeature.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-base mb-1">{highlightedFeature.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {highlightedFeature.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onFeatureClick?.(highlightedFeature);
                    dismissFeature(highlightedFeature.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Odkryj teraz
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Feature Teaser */}
      {nextFeature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Następna funkcja
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Poziom {nextFeature.requiredLevel}
              </span>
            </div>

            <h4 className="font-medium mb-1">{nextFeature.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {nextFeature.description}
            </p>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Postęp do odblokowania</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Jeszcze {nextFeature.requiredLevel - userLevel} poziomów
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Feature Discovery Panel */}
      <AnimatePresence>
        {userLevel >= 5 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Twoje odblokowane funkcje
              </h3>
              <div className="grid gap-2">
                {features
                  .filter(f => userLevel >= f.requiredLevel)
                  .map((feature) => (
                    <motion.button
                      key={feature.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFeatureClick?.(feature)}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-sm">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}