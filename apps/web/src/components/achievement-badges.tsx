'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Sparkles } from 'lucide-react';
import { Button, Card } from '@dopaforge/ui';
import { Achievement, ACHIEVEMENTS, AchievementSystem } from '@/lib/achievements';
import { SoundSystem } from '@/lib/sound-system';
import { LinearProgress } from './progress-indicators';

interface AchievementBadgesProps {
  userId: string;
  userStats: any;
  onAchievementUnlocked: (achievement: Achievement) => void;
}

export function AchievementBadges({ 
  userId, 
  userStats, 
  onAchievementUnlocked 
}: AchievementBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const soundSystem = SoundSystem.getInstance();

  useEffect(() => {
    checkForNewAchievements();
  }, [userStats]);

  const checkForNewAchievements = () => {
    const unlockedIds = JSON.parse(
      localStorage.getItem(`achievements_${userId}`) || '[]'
    );

    const newAchievements = AchievementSystem.checkAchievements({
      ...userStats,
      unlockedAchievements: unlockedIds
    });

    if (newAchievements.length > 0) {
      // Show unlock animation for each
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          setNewlyUnlocked(achievement);
          soundSystem.play('achievement');
          onAchievementUnlocked(achievement);

          // Save to localStorage
          const updated = [...unlockedIds, achievement.id];
          localStorage.setItem(`achievements_${userId}`, JSON.stringify(updated));
        }, index * 2000);
      });
    }

    // Update achievements list with progress
    const achievementsWithProgress = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      progress: AchievementSystem.getProgress(achievement, userStats),
      unlockedAt: unlockedIds.includes(achievement.id) ? new Date() : undefined
    }));

    setAchievements(achievementsWithProgress);
  };

  const categories = ['all', 'tasks', 'streaks', 'focus', 'special', 'secret'];
  const filteredAchievements = achievements.filter(
    a => selectedCategory === 'all' || a.category === selectedCategory
  );

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  return (
    <>
      {/* Achievement Button */}
      <Button
        onClick={() => setShowGallery(true)}
        variant="outline"
        className="relative"
      >
        <Trophy className="h-5 w-5 mr-2" />
        Osiągnięcia
        <span className="ml-2 text-sm text-muted-foreground">
          {unlockedCount}/{totalCount}
        </span>
      </Button>

      {/* Achievement Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGallery(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[800px] max-h-[80vh]"
            >
              <Card className="p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Galeria Osiągnięć</h2>
                    <p className="text-muted-foreground">
                      Odblokowano {unlockedCount} z {totalCount} osiągnięć
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowGallery(false)}
                  >
                    Zamknij
                  </Button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category === 'all' ? 'Wszystkie' : category}
                    </Button>
                  ))}
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
                  {filteredAchievements.map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Achievement Unlock Animation */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60]"
            onAnimationComplete={() => 
              setTimeout(() => setNewlyUnlocked(null), 3000)
            }
          >
            <Card className="p-6 shadow-2xl border-2 border-yellow-500">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 1 }}
                  className="text-6xl"
                >
                  {newlyUnlocked.icon}
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-yellow-600">
                    NOWE OSIĄGNIĘCIE!
                  </p>
                  <h3 className="text-xl font-bold">{newlyUnlocked.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {newlyUnlocked.description}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    +{newlyUnlocked.reward.xp} XP
                  </p>
                </div>
              </div>

              {/* Sparkles animation */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: 0, 
                    y: 0,
                    scale: 0
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 100 - 50,
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Individual Achievement Card
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isUnlocked = !!achievement.unlockedAt;
  const rarityColor = AchievementSystem.getRarityColor(achievement.rarity);
  const rarityBg = AchievementSystem.getRarityBgColor(achievement.rarity);

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
      className={`relative p-4 rounded-lg border transition-all ${
        isUnlocked
          ? `${rarityBg} border-current cursor-pointer`
          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-3xl">
          {isUnlocked ? achievement.icon : '❓'}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className={`font-semibold ${isUnlocked ? '' : 'text-gray-500'}`}>
            {achievement.name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>

          {/* Progress */}
          {!isUnlocked && achievement.progress !== undefined && (
            <div className="mt-2">
              <LinearProgress
                value={achievement.progress}
                max={100}
                height={4}
                color="#6b7280"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(achievement.progress)}% ukończone
              </p>
            </div>
          )}

          {/* Reward */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium">
              +{achievement.reward.xp} XP
            </span>
            {achievement.reward.badge && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {achievement.reward.badge}
              </span>
            )}
          </div>
        </div>

        {/* Lock overlay */}
        {!isUnlocked && (
          <Lock className="h-4 w-4 text-gray-400 absolute top-2 right-2" />
        )}

        {/* Rarity indicator */}
        {isUnlocked && (
          <div className={`absolute top-2 right-2 ${rarityColor}`}>
            <Star className="h-4 w-4 fill-current" />
          </div>
        )}
      </div>

      {/* Unlock date */}
      {isUnlocked && achievement.unlockedAt && (
        <p className="text-xs text-muted-foreground mt-2">
          Odblokowano: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}