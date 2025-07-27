'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Heart, Zap, Clock, AlertTriangle, Trophy, Skull } from 'lucide-react';
import { Button, Card, Progress } from '@dopaforge/ui';
import { Boss, BossBattleState, BossBattleSystem, BOSSES } from '@/lib/boss-battles';
import { SoundSystem } from '@/lib/sound-system';
import { cn } from '@/lib/utils';

interface BossBattleProps {
  userLevel: number;
  onVictory: (rewards: any) => void;
  onDefeat: () => void;
}

export function BossBattle({ userLevel, onVictory, onDefeat }: BossBattleProps) {
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [battleState, setBattleState] = useState<BossBattleState | null>(null);
  const [showBossSelect, setShowBossSelect] = useState(true);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number; damage: number; x: number; y: number }>>([]);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const soundSystem = SoundSystem.getInstance();

  useEffect(() => {
    BossBattleSystem.loadBattleState();
    const currentBattle = BossBattleSystem.getCurrentBattle();
    if (currentBattle && currentBattle.status === 'fighting') {
      const boss = BossBattleSystem.getBossInfo(currentBattle.bossId);
      if (boss) {
        setSelectedBoss(boss);
        setBattleState(currentBattle);
        setShowBossSelect(false);
      }
    }
  }, []);

  const startBattle = (boss: Boss) => {
    const { canChallenge, reason } = BossBattleSystem.canChallengeBoss(boss.id, userLevel);
    if (!canChallenge) {
      alert(reason);
      return;
    }

    const battle = BossBattleSystem.startBattle(boss.id);
    if (battle) {
      battle.status = 'fighting';
      setBattleState(battle);
      setSelectedBoss(boss);
      setShowBossSelect(false);
      soundSystem.play('battleStart');
    }
  };

  const dealDamage = (baseDamage: number, taskInfo?: any) => {
    const result = BossBattleSystem.dealDamage(baseDamage, taskInfo);
    
    // Show damage number
    const id = Date.now();
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 50;
    setDamageNumbers(prev => [...prev, { id, damage: result.damageDealt, x, y }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 2000);

    // Update battle state
    const newBattleState = BossBattleSystem.getCurrentBattle();
    setBattleState(newBattleState);

    // Handle phase transition
    if (result.phaseComplete && !result.battleWon) {
      setPhaseTransition(true);
      soundSystem.play('phaseComplete');
      setTimeout(() => setPhaseTransition(false), 2000);
    }

    // Handle victory
    if (result.battleWon) {
      soundSystem.play('victory');
      setTimeout(() => {
        onVictory(result.rewards);
        setShowBossSelect(true);
        setBattleState(null);
        setSelectedBoss(null);
      }, 3000);
    }
  };

  const forfeitBattle = () => {
    if (confirm('Czy na pewno chcesz się poddać? Stracisz cały postęp!')) {
      BossBattleSystem.forfeitBattle();
      soundSystem.play('defeat');
      onDefeat();
      setShowBossSelect(true);
      setBattleState(null);
      setSelectedBoss(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'normal': return 'text-green-500';
      case 'hard': return 'text-orange-500';
      case 'legendary': return 'text-purple-500';
      case 'mythic': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyGlow = (difficulty: string) => {
    switch (difficulty) {
      case 'legendary': return 'shadow-purple-500/50';
      case 'mythic': return 'shadow-red-500/50';
      default: return '';
    }
  };

  if (showBossSelect) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Wyzwij Bossa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BOSSES.map(boss => {
            const { canChallenge, reason } = BossBattleSystem.canChallengeBoss(boss.id, userLevel);
            
            return (
              <motion.div
                key={boss.id}
                whileHover={canChallenge ? { scale: 1.02 } : {}}
                className={cn(
                  'p-4 border-2 rounded-lg cursor-pointer transition-all',
                  canChallenge ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed',
                  getDifficultyGlow(boss.difficulty)
                )}
                onClick={() => canChallenge && startBattle(boss)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{boss.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{boss.name}</h3>
                    <p className="text-sm text-muted-foreground">{boss.title}</p>
                    <p className="text-xs mt-1">{boss.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <span className={cn('text-xs font-medium', getDifficultyColor(boss.difficulty))}>
                        {boss.difficulty.toUpperCase()}
                      </span>
                      <span className="text-xs">
                        <Heart className="h-3 w-3 inline mr-1" />
                        {boss.totalHealth} HP
                      </span>
                      <span className="text-xs">
                        Level {boss.unlockLevel}+
                      </span>
                    </div>

                    {!canChallenge && (
                      <p className="text-xs text-red-500 mt-2">{reason}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    );
  }

  if (!selectedBoss || !battleState) {
    return null;
  }

  const currentPhase = selectedBoss.phases[battleState.currentPhase];
  const healthPercentage = (battleState.currentHealth / selectedBoss.totalHealth) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <Card className="p-6 overflow-hidden">
        {/* Background effect */}
        <div 
          className={cn(
            'absolute inset-0 opacity-10',
            selectedBoss.difficulty === 'mythic' && 'bg-gradient-to-br from-red-500 to-black animate-pulse',
            selectedBoss.difficulty === 'legendary' && 'bg-gradient-to-br from-purple-500 to-black',
            selectedBoss.difficulty === 'hard' && 'bg-gradient-to-br from-orange-500 to-black',
            selectedBoss.difficulty === 'normal' && 'bg-gradient-to-br from-green-500 to-black'
          )}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sword className="h-6 w-6" />
              Boss Battle
            </h2>
            <p className="text-sm text-muted-foreground">Próba #{battleState.attempts}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={forfeitBattle}
          >
            <Skull className="h-4 w-4 mr-2" />
            Poddaj się
          </Button>
        </div>

        {/* Boss Info */}
        <div className="relative z-10 text-center mb-6">
          <motion.div
            animate={phaseTransition ? {
              scale: [1, 1.5, 1],
              rotate: [0, 360, 0]
            } : {}}
            transition={{ duration: 1 }}
            className="text-6xl mb-2"
          >
            {selectedBoss.icon}
          </motion.div>
          <h3 className="text-xl font-bold">{selectedBoss.name}</h3>
          <p className="text-sm text-muted-foreground">{selectedBoss.title}</p>
        </div>

        {/* Health Bar */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Zdrowie</span>
            <span className="text-sm">
              {Math.max(0, battleState.currentHealth)} / {selectedBoss.totalHealth} HP
            </span>
          </div>
          <div className="relative h-8 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600"
              initial={{ width: '100%' }}
              animate={{ width: `${healthPercentage}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
            {/* Phase markers */}
            {selectedBoss.phases.map((phase, index) => {
              const markerPosition = ((selectedBoss.totalHealth - phase.health) / selectedBoss.totalHealth) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                  style={{ left: `${markerPosition}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Current Phase */}
        <div className="relative z-10 mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">
            Faza {battleState.currentPhase + 1}: {currentPhase.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{currentPhase.description}</p>
          
          {/* Phase Mechanics */}
          <div className="space-y-2">
            {currentPhase.mechanics.map((mechanic, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>{mechanic.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Battle Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Sword className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <p className="text-sm font-medium">Obrażenia</p>
            <p className="text-xl font-bold">{Math.round(battleState.damageDealt)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-sm font-medium">Zadania</p>
            <p className="text-xl font-bold">{battleState.tasksCompleted}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-medium">Czas</p>
            <p className="text-xl font-bold">
              {Math.floor((Date.now() - battleState.startedAt.getTime()) / 60000)}m
            </p>
          </div>
        </div>

        {/* Weaknesses & Resistances */}
        {(selectedBoss.weaknesses || selectedBoss.resistances) && (
          <div className="relative z-10 grid grid-cols-2 gap-4 text-sm">
            {selectedBoss.weaknesses && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="font-medium text-green-700 dark:text-green-300 mb-1">Słabości:</p>
                <ul className="space-y-1">
                  {selectedBoss.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-green-600 dark:text-green-400">• {weakness}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedBoss.resistances && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="font-medium text-red-700 dark:text-red-300 mb-1">Odporności:</p>
                <ul className="space-y-1">
                  {selectedBoss.resistances.map((resistance, index) => (
                    <li key={index} className="text-red-600 dark:text-red-400">• {resistance}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Damage Numbers */}
        <AnimatePresence>
          {damageNumbers.map(({ id, damage, x, y }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 0, x, scale: 0.5 }}
              animate={{ opacity: 1, y: y - 50, scale: 1 }}
              exit={{ opacity: 0, y: y - 100 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <span className="text-3xl font-bold text-red-500 drop-shadow-lg">
                -{damage}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Phase Transition Effect */}
        <AnimatePresence>
          {phaseTransition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Faza Ukończona!</h3>
                <p className="text-muted-foreground">Przygotuj się na następną fazę...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Victory Effect */}
        {battleState.status === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-yellow-400/80 to-yellow-600/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1 }}
              className="text-center"
            >
              <Trophy className="h-24 w-24 text-white mx-auto mb-4 animate-bounce" />
              <h3 className="text-4xl font-bold text-white mb-2">ZWYCIĘSTWO!</h3>
              <p className="text-xl text-white/90">Pokonałeś {selectedBoss.name}!</p>
            </motion.div>
          </motion.div>
        )}
      </Card>

      {/* Test Controls (for demonstration) */}
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => dealDamage(20, { completedInTime: true, maintainedStreak: true, perfectAccuracy: true })}
          size="sm"
        >
          Zadaj 20 obrażeń (perfect)
        </Button>
        <Button
          onClick={() => dealDamage(10, { completedInTime: true })}
          size="sm"
          variant="outline"
        >
          Zadaj 10 obrażeń (normal)
        </Button>
      </div>
    </motion.div>
  );
}
