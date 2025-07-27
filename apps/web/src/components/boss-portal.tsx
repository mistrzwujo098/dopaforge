'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, ChevronRight, Lock, Clock, Flame } from 'lucide-react';
import { Button, Card } from '@dopaforge/ui';
import { Badge } from '@dopaforge/ui';
import { Boss, BossBattleSystem, BOSSES } from '@/lib/boss-battles';
import { cn } from '@/lib/utils';

interface BossPortalProps {
  userLevel: number;
  onBossSelect: (boss: Boss) => void;
}

export function BossPortal({ userLevel, onBossSelect }: BossPortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableBosses, setAvailableBosses] = useState<Boss[]>([]);
  const [cooldowns, setCooldowns] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    updateAvailableBosses();
    const interval = setInterval(updateAvailableBosses, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [userLevel]);

  const updateAvailableBosses = () => {
    const available = BOSSES.filter(boss => {
      const { canChallenge } = BossBattleSystem.canChallengeBoss(boss.id, userLevel);
      return canChallenge || boss.unlockLevel <= userLevel;
    });
    setAvailableBosses(available);

    // Update cooldowns
    const newCooldowns = new Map<string, number>();
    BOSSES.forEach(boss => {
      const { canChallenge, reason } = BossBattleSystem.canChallengeBoss(boss.id, userLevel);
      if (!canChallenge && reason?.includes('Cooldown')) {
        const hours = parseInt(reason.match(/\d+/)?.[0] || '0');
        newCooldowns.set(boss.id, hours);
      }
    });
    setCooldowns(newCooldowns);
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      normal: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      hard: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      legendary: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      mythic: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[difficulty as keyof typeof colors] || colors.normal;
  };

  const getNextAvailableBoss = () => {
    return BOSSES.find(boss => {
      if (boss.unlockLevel > userLevel) return false;
      const { canChallenge } = BossBattleSystem.canChallengeBoss(boss.id, userLevel);
      return canChallenge;
    });
  };

  const nextBoss = getNextAvailableBoss();

  return (
    <>
      {/* Portal Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className={cn(
            'relative overflow-hidden',
            nextBoss && 'border-yellow-500 dark:border-yellow-400'
          )}
        >
          {nextBoss && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          )}
          <Swords className="h-5 w-5 mr-2" />
          Boss Arena
          {nextBoss && (
            <Flame className="h-4 w-4 ml-2 text-orange-500 animate-pulse" />
          )}
        </Button>
      </motion.div>

      {/* Boss List Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[600px] max-h-[80vh]"
            >
              <Card className="p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Swords className="h-6 w-6" />
                    Boss Arena
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Zamknij
                  </Button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {BOSSES.map(boss => {
                    const { canChallenge, reason } = BossBattleSystem.canChallengeBoss(boss.id, userLevel);
                    const isLocked = boss.unlockLevel > userLevel;
                    const onCooldown = cooldowns.has(boss.id);

                    return (
                      <motion.div
                        key={boss.id}
                        whileHover={canChallenge ? { x: 5 } : {}}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all cursor-pointer',
                          canChallenge && 'hover:shadow-lg border-primary/50',
                          !canChallenge && 'opacity-60 cursor-not-allowed',
                          isLocked && 'bg-gray-50 dark:bg-gray-900'
                        )}
                        onClick={() => {
                          if (canChallenge) {
                            onBossSelect(boss);
                            setIsOpen(false);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{boss.icon}</div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{boss.name}</h3>
                              <Badge className={cn('text-xs', getDifficultyBadge(boss.difficulty))}>
                                {boss.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{boss.title}</p>
                            <p className="text-xs mt-1">{boss.description}</p>
                          </div>

                          <div className="text-right">
                            {isLocked ? (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Lock className="h-4 w-4" />
                                <span className="text-xs">Lvl {boss.unlockLevel}</span>
                              </div>
                            ) : onCooldown ? (
                              <div className="flex items-center gap-1 text-orange-500">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs">{cooldowns.get(boss.id)}h</span>
                              </div>
                            ) : canChallenge ? (
                              <ChevronRight className="h-5 w-5 text-primary" />
                            ) : (
                              <span className="text-xs text-red-500">{reason}</span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar for defeated bosses */}
                        {!isLocked && !canChallenge && !onCooldown && (
                          <div className="mt-2">
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Pokonany!</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t dark:border-gray-800">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {availableBosses.filter(b => b.unlockLevel <= userLevel).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Odblokowane</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {BOSSES.filter(b => {
                          const { canChallenge } = BossBattleSystem.canChallengeBoss(b.id, userLevel);
                          return !canChallenge && b.unlockLevel <= userLevel && !cooldowns.has(b.id);
                        }).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Pokonane</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {cooldowns.size}
                      </p>
                      <p className="text-xs text-muted-foreground">Na Cooldownie</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Mini boss indicator component
export function BossIndicator({ userLevel }: { userLevel: number }) {
  const [nextBoss, setNextBoss] = useState<Boss | null>(null);

  useEffect(() => {
    const boss = BOSSES.find(b => {
      if (b.unlockLevel > userLevel) return false;
      const { canChallenge } = BossBattleSystem.canChallengeBoss(b.id, userLevel);
      return canChallenge;
    });
    setNextBoss(boss || null);
  }, [userLevel]);

  if (!nextBoss) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-32 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 rounded-lg shadow-lg"
    >
      <div className="flex items-center gap-2">
        <Swords className="h-5 w-5" />
        <div>
          <p className="text-sm font-medium">Boss Dostępny!</p>
          <p className="text-xs opacity-90">{nextBoss.name} czeka</p>
        </div>
      </div>
    </motion.div>
  );
}
