'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Progress,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge
} from '@dopaforge/ui';
import { 
  Trophy, 
  Lock, 
  Unlock, 
  ChevronRight, 
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { 
  getLevelInfo, 
  getNextLevel, 
  getProgressToNextLevel,
  getUnlockedFeatures,
  getLockedFeatures,
  getNextUnlock,
  type Level,
  type UnlockableFeature
} from '@/lib/level-system';
import { t } from '@/lib/i18n';

interface LevelProgressProps {
  totalXP: number;
  onFeatureClick?: (feature: UnlockableFeature) => void;
}

export function LevelProgress({ totalXP, onFeatureClick }: LevelProgressProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showNewUnlock, setShowNewUnlock] = useState(false);
  const [newUnlock, setNewUnlock] = useState<UnlockableFeature | null>(null);
  const [lastLevel, setLastLevel] = useState<number>(0);

  const currentLevel = getLevelInfo(totalXP);
  const nextLevel = getNextLevel(totalXP);
  const progress = getProgressToNextLevel(totalXP);
  const unlockedFeatures = getUnlockedFeatures(currentLevel.level);
  const lockedFeatures = getLockedFeatures(currentLevel.level);
  const nextUnlock = getNextUnlock(currentLevel.level);

  // Check for new level up
  useEffect(() => {
    if (currentLevel.level > lastLevel && lastLevel > 0) {
      // Level up! Check for new unlocks
      const newFeatures = unlockedFeatures.filter(
        f => f.requiredLevel === currentLevel.level
      );
      
      if (newFeatures.length > 0) {
        setNewUnlock(newFeatures[0]);
        setShowNewUnlock(true);
      }
    }
    setLastLevel(currentLevel.level);
  }, [currentLevel.level]);

  const handleFeatureClick = (feature: UnlockableFeature) => {
    if (onFeatureClick) {
      onFeatureClick(feature);
    }
    setShowDetails(false);
  };

  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDetails(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {t('dashboard.level', { level: currentLevel.level })} - {currentLevel.title}
            </CardTitle>
            <Badge variant="secondary" className="text-2xl px-2 py-0">
              {currentLevel.badge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {totalXP} / {nextLevel ? nextLevel.minXP : currentLevel.maxXP} XP
                </span>
                <span className="text-muted-foreground">
                  {progress.percentage}%
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
            
            {nextUnlock && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Następne odblokowanie: poziom {nextUnlock.requiredLevel}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Level Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="text-4xl">{currentLevel.badge}</div>
              <div>
                <div>Poziom {currentLevel.level}: {currentLevel.title}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {totalXP} XP zdobyte
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Current Level Perks */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Twoje obecne przywileje
              </h3>
              <div className="space-y-2">
                {currentLevel.perks.map((perk, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                    {perk}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Unlocked Features */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Unlock className="h-5 w-5 text-emerald-500" />
                Odblokowane funkcje
              </h3>
              <div className="grid gap-2">
                {unlockedFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`${feature.route || feature.component ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
                      onClick={() => (feature.route || feature.component) && handleFeatureClick(feature)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{feature.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {feature.description}
                            </div>
                          </div>
                          {(feature.route || feature.component) && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Locked Features */}
            {lockedFeatures.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-400" />
                  Przyszłe odblokowania
                </h3>
                <div className="grid gap-2">
                  {lockedFeatures.slice(0, 5).map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="opacity-60">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                <Lock className="h-3 w-3" />
                                {feature.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {feature.description} • Poziom {feature.requiredLevel}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Level Preview */}
            {nextLevel && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Następny poziom
                </h3>
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{nextLevel.badge}</div>
                      <div className="flex-1">
                        <div className="font-semibold">
                          Poziom {nextLevel.level}: {nextLevel.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Potrzebujesz jeszcze {nextLevel.minXP - totalXP} XP
                        </div>
                        <div className="text-sm mt-2">
                          <strong>Nowe przywileje:</strong>
                          <ul className="mt-1">
                            {nextLevel.perks.map((perk, index) => (
                              <li key={index} className="text-muted-foreground">
                                • {perk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Unlock Celebration */}
      <AnimatePresence>
        {showNewUnlock && newUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="inline-block"
                >
                  <Sparkles className="h-16 w-16 text-yellow-500" />
                </motion.div>
                
                <h2 className="text-2xl font-bold">
                  Nowa funkcja odblokowana!
                </h2>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{newUnlock.name}</h3>
                  <p className="text-muted-foreground">{newUnlock.description}</p>
                </div>
                
                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewUnlock(false)}
                  >
                    Później
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewUnlock(false);
                      handleFeatureClick(newUnlock);
                    }}
                  >
                    Wypróbuj teraz
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}