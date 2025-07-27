'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap, Lock, Clock, Coins } from 'lucide-react';
import { Button, Card } from '@dopaforge/ui';
import { PowerUp, POWER_UPS, PowerUpSystem } from '@/lib/power-ups';
import { SoundSystem } from '@/lib/sound-system';
import { cn } from '@/lib/utils';

interface PowerUpsStoreProps {
  userPoints: number;
  userLevel: number;
  onPurchase: (powerUp: PowerUp) => void;
}

export function PowerUpsStore({ userPoints, userLevel, onPurchase }: PowerUpsStoreProps) {
  const [showStore, setShowStore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePowerUps, setActivePowerUps] = useState<any[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const soundSystem = SoundSystem.getInstance();

  useEffect(() => {
    PowerUpSystem.loadPowerUps();
    updateActivePowerUps();
    
    const interval = setInterval(updateActivePowerUps, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateActivePowerUps = () => {
    setActivePowerUps(PowerUpSystem.getActivePowerUps());
  };

  const categories = ['all', 'boost', 'shield', 'utility', 'special'];
  const filteredPowerUps = POWER_UPS.filter(
    p => selectedCategory === 'all' || p.type === selectedCategory
  );

  const handlePurchase = async (powerUp: PowerUp) => {
    const { canBuy, reason } = PowerUpSystem.canPurchase(powerUp, userPoints, userLevel);
    
    if (!canBuy) {
      alert(reason);
      return;
    }

    setPurchasingId(powerUp.id);
    soundSystem.play('coinCollect');
    
    // Animate purchase
    await new Promise(resolve => setTimeout(resolve, 500));
    
    PowerUpSystem.activatePowerUp(powerUp);
    onPurchase(powerUp);
    updateActivePowerUps();
    
    soundSystem.play('powerUp');
    setPurchasingId(null);
    
    // Close store for immediate use power-ups
    if (powerUp.type === 'utility' || powerUp.type === 'special') {
      setTimeout(() => setShowStore(false), 1000);
    }
  };

  const getRarityColor = (rarity: PowerUp['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50 dark:bg-gray-900';
      case 'rare': return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'epic': return 'border-purple-500 bg-purple-50 dark:bg-purple-950';
      case 'legendary': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    }
  };

  const getRarityGlow = (rarity: PowerUp['rarity']) => {
    switch (rarity) {
      case 'rare': return 'shadow-blue-500/20';
      case 'epic': return 'shadow-purple-500/30';
      case 'legendary': return 'shadow-yellow-500/40';
      default: return '';
    }
  };

  return (
    <>
      {/* Store Button */}
      <Button
        onClick={() => setShowStore(true)}
        variant="outline"
        className="relative"
      >
        <ShoppingBag className="h-5 w-5 mr-2" />
        Sklep Mocy
        {activePowerUps.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
            {activePowerUps.length}
          </span>
        )}
      </Button>

      {/* Store Modal */}
      <AnimatePresence>
        {showStore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStore(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[900px] max-h-[80vh]"
            >
              <Card className="p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Sklep Mocy</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">{userPoints} punktów</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowStore(false)}
                  >
                    Zamknij
                  </Button>
                </div>

                {/* Active Power-ups */}
                {activePowerUps.length > 0 && (
                  <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <h3 className="font-medium mb-2">Aktywne Moce</h3>
                    <div className="flex flex-wrap gap-2">
                      {activePowerUps.map(({ powerUp, timeLeft, stackCount }) => (
                        <div
                          key={powerUp.id}
                          className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm"
                        >
                          <span>{powerUp.icon}</span>
                          <span>{powerUp.name}</span>
                          {stackCount > 1 && (
                            <span className="font-bold">x{stackCount}</span>
                          )}
                          {timeLeft && (
                            <span className="text-xs text-muted-foreground">
                              {timeLeft}m
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6">
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

                {/* Power-ups Grid */}
                <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                  {filteredPowerUps.map(powerUp => {
                    const { canBuy, reason } = PowerUpSystem.canPurchase(
                      powerUp, 
                      userPoints, 
                      userLevel
                    );
                    const isActive = PowerUpSystem.hasActivePowerUp(powerUp.id);

                    return (
                      <motion.div
                        key={powerUp.id}
                        whileHover={canBuy ? { scale: 1.02 } : {}}
                        className={cn(
                          'relative p-4 rounded-lg border-2 transition-all',
                          getRarityColor(powerUp.rarity),
                          getRarityGlow(powerUp.rarity),
                          !canBuy && 'opacity-60',
                          isActive && 'ring-2 ring-purple-500'
                        )}
                      >
                        {/* Locked overlay */}
                        {powerUp.unlockLevel && userLevel < powerUp.unlockLevel && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="h-8 w-8 text-white mb-2 mx-auto" />
                              <p className="text-white text-sm font-medium">
                                Level {powerUp.unlockLevel}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{powerUp.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{powerUp.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {powerUp.description}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {powerUp.effect.duration && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  <span>{powerUp.effect.duration}m</span>
                                </div>
                              )}
                              {powerUp.cooldown && (
                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                  <Clock className="h-3 w-3" />
                                  <span>CD: {powerUp.cooldown}m</span>
                                </div>
                              )}
                              {powerUp.maxStack && (
                                <div className="text-xs">
                                  Max: {powerUp.maxStack}x
                                </div>
                              )}
                            </div>

                            {/* Purchase button */}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="font-bold">{powerUp.cost}</span>
                              </div>
                              
                              {canBuy ? (
                                <Button
                                  size="sm"
                                  onClick={() => handlePurchase(powerUp)}
                                  disabled={purchasingId === powerUp.id}
                                  className={cn(
                                    purchasingId === powerUp.id && 'animate-pulse'
                                  )}
                                >
                                  {purchasingId === powerUp.id ? '...' : 'Kup'}
                                </Button>
                              ) : (
                                <span className="text-xs text-red-500">
                                  {reason}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rarity indicator */}
                        <div className={cn(
                          'absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium capitalize',
                          powerUp.rarity === 'rare' && 'bg-blue-500 text-white',
                          powerUp.rarity === 'epic' && 'bg-purple-500 text-white',
                          powerUp.rarity === 'legendary' && 'bg-yellow-500 text-black'
                        )}>
                          {powerUp.rarity}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Active Power-ups Display */}
      <div className="fixed bottom-20 right-4 space-y-2">
        <AnimatePresence>
          {activePowerUps.map(({ powerUp, timeLeft, stackCount }) => (
            <motion.div
              key={powerUp.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center gap-2"
            >
              <span className="text-2xl">{powerUp.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{powerUp.name}</p>
                {timeLeft && (
                  <p className="text-xs text-muted-foreground">
                    {timeLeft}m pozostało
                  </p>
                )}
              </div>
              {stackCount > 1 && (
                <span className="text-sm font-bold">x{stackCount}</span>
              )}
              <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}