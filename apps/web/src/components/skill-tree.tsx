'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Check, RefreshCw, Info } from 'lucide-react';
import { Button, Card, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from '@dopaforge/ui';
import { SkillTree, SkillNode, SkillTreeSystem, SKILL_TREES } from '@/lib/skill-trees';
import { SoundSystem } from '@/lib/sound-system';
import { cn } from '@/lib/utils';

interface SkillTreeProps {
  userLevel: number;
  onSkillUnlock: (skillId: string, treeId: string) => void;
}

export function SkillTreeComponent({ userLevel, onSkillUnlock }: SkillTreeProps) {
  const [selectedTree, setSelectedTree] = useState(SKILL_TREES[0].id);
  const [skillPoints, setSkillPoints] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [unlockedSkills, setUnlockedSkills] = useState<Map<string, number>>(new Map());
  const soundSystem = SoundSystem.getInstance();

  useEffect(() => {
    SkillTreeSystem.loadProgress();
    updateSkillData();
  }, []);

  const updateSkillData = () => {
    setSkillPoints(SkillTreeSystem.getSkillPoints());
    const skills = new Map<string, number>();
    SKILL_TREES.forEach(tree => {
      tree.nodes.forEach(node => {
        const level = SkillTreeSystem.getSkillLevel(node.id, tree.id);
        if (level > 0) {
          skills.set(`${tree.id}.${node.id}`, level);
        }
      });
    });
    setUnlockedSkills(skills);
  };

  const handleUnlockSkill = (node: SkillNode, treeId: string) => {
    const { canUnlock, reason } = SkillTreeSystem.canUnlockSkill(node.id, treeId, userLevel);
    
    if (!canUnlock) {
      alert(reason);
      return;
    }

    if (SkillTreeSystem.unlockSkill(node.id, treeId)) {
      soundSystem.play('levelUp');
      onSkillUnlock(node.id, treeId);
      updateSkillData();
      
      // Show unlock animation
      const key = `${treeId}.${node.id}`;
      const newLevel = SkillTreeSystem.getSkillLevel(node.id, treeId);
      if (newLevel === node.maxLevel) {
        soundSystem.play('achievement');
      }
    }
  };

  const handleResetTree = () => {
    const refunded = SkillTreeSystem.resetTree(selectedTree);
    if (refunded > 0) {
      soundSystem.play('coinCollect');
      alert(`Zresetowano drzewo. Odzyskano ${refunded} punktów umiejętności.`);
      updateSkillData();
      setShowResetConfirm(false);
    }
  };

  const getNodeColor = (node: SkillNode, tree: SkillTree) => {
    const level = SkillTreeSystem.getSkillLevel(node.id, tree.id);
    const { canUnlock } = SkillTreeSystem.canUnlockSkill(node.id, tree.id, userLevel);
    
    if (level === node.maxLevel) {
      return 'bg-yellow-500 border-yellow-600';
    } else if (level > 0) {
      return 'bg-blue-500 border-blue-600';
    } else if (canUnlock) {
      return 'bg-green-500 border-green-600 animate-pulse';
    } else {
      return 'bg-gray-400 border-gray-500';
    }
  };

  const drawConnections = (tree: SkillTree) => {
    const connections: JSX.Element[] = [];
    
    tree.nodes.forEach(node => {
      if (node.requirements) {
        node.requirements.forEach(req => {
          const parentNode = tree.nodes.find(n => n.id === req.nodeId);
          if (parentNode) {
            const parentLevel = SkillTreeSystem.getSkillLevel(parentNode.id, tree.id);
            const isActive = parentLevel >= req.minLevel;
            
            connections.push(
              <line
                key={`${parentNode.id}-${node.id}`}
                x1={`${parentNode.position.x}%`}
                y1={`${parentNode.position.y}%`}
                x2={`${node.position.x}%`}
                y2={`${node.position.y}%`}
                stroke={isActive ? '#3b82f6' : '#6b7280'}
                strokeWidth="2"
                strokeDasharray={isActive ? '0' : '5,5'}
                opacity={isActive ? 1 : 0.5}
              />
            );
          }
        });
      }
    });
    
    return connections;
  };

  const currentTree = SKILL_TREES.find(t => t.id === selectedTree)!;
  const treeProgress = SkillTreeSystem.getTreeProgress(selectedTree);
  const activeEffects = SkillTreeSystem.getActiveEffects();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Drzewa Umiejętności</h2>
          <div className="flex items-center gap-2 mt-1">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">{skillPoints} punktów umiejętności</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          disabled={treeProgress.unlockedNodes === 0}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Drzewa
        </Button>
      </div>

      {/* Tree Tabs */}
      <Tabs value={selectedTree} onValueChange={setSelectedTree}>
        <TabsList className="grid grid-cols-3 mb-6">
          {SKILL_TREES.map(tree => {
            const progress = SkillTreeSystem.getTreeProgress(tree.id);
            return (
              <TabsTrigger key={tree.id} value={tree.id} className="relative">
                <span className="mr-2">{tree.icon}</span>
                <span>{tree.name}</span>
                {progress.unlockedNodes > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {progress.unlockedNodes}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {SKILL_TREES.map(tree => (
          <TabsContent key={tree.id} value={tree.id}>
            <div className="space-y-6">
              {/* Tree Description */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">{tree.description}</p>
                <div className="mt-2">
                  <Progress value={treeProgress.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {treeProgress.percentage}% ukończone ({treeProgress.unlockedNodes}/{treeProgress.totalNodes} umiejętności)
                  </p>
                </div>
              </div>

              {/* Skill Tree Visualization */}
              <div className="relative h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                {/* SVG for connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {drawConnections(tree)}
                </svg>

                {/* Skill Nodes */}
                {tree.nodes.map(node => {
                  const level = SkillTreeSystem.getSkillLevel(node.id, tree.id);
                  const { canUnlock, reason } = SkillTreeSystem.canUnlockSkill(node.id, tree.id, userLevel);
                  
                  return (
                    <motion.div
                      key={node.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${node.position.x}%`,
                        top: `${node.position.y}%`
                      }}
                      whileHover={{ scale: 1.1 }}
                      onHoverStart={() => setHoveredNode(node)}
                      onHoverEnd={() => setHoveredNode(null)}
                    >
                      <button
                        onClick={() => handleUnlockSkill(node, tree.id)}
                        disabled={!canUnlock && level < node.maxLevel}
                        className={cn(
                          'relative w-16 h-16 rounded-full border-4 transition-all',
                          'flex items-center justify-center text-2xl',
                          getNodeColor(node, tree),
                          canUnlock && 'hover:scale-110 cursor-pointer',
                          !canUnlock && level < node.maxLevel && 'cursor-not-allowed opacity-75'
                        )}
                      >
                        <span className="select-none">{node.icon}</span>
                        
                        {/* Level indicator */}
                        {level > 0 && (
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-current">
                            {level}/{node.maxLevel}
                          </div>
                        )}

                        {/* Lock icon */}
                        {!canUnlock && level === 0 && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Lock className="h-6 w-6 text-white" />
                          </div>
                        )}

                        {/* Max level star */}
                        {level === node.maxLevel && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute -top-2 -right-2"
                          >
                            <Sparkles className="h-5 w-5 text-yellow-400" />
                          </motion.div>
                        )}
                      </button>

                      {/* Node name */}
                      <p className="text-xs text-center mt-2 font-medium max-w-[80px]">
                        {node.name}
                      </p>
                    </motion.div>
                  );
                })}

                {/* Hover tooltip */}
                <AnimatePresence>
                  {hoveredNode && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-2 border-primary"
                      style={{
                        left: `${hoveredNode.position.x}%`,
                        top: `${hoveredNode.position.y + 10}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <h4 className="font-semibold mb-1">{hoveredNode.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{hoveredNode.description}</p>
                      
                      <div className="space-y-1 mb-2">
                        {hoveredNode.effects.map((effect, index) => (
                          <p key={index} className="text-xs">
                            • {effect.type}: +{effect.value}{effect.perLevel && ` (+${effect.perLevel}/lvl)`}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span>Koszt: {hoveredNode.cost.points} pkt</span>
                        <span>Poziom: {hoveredNode.cost.level}+</span>
                      </div>

                      {hoveredNode.requirements && (
                        <div className="mt-2 pt-2 border-t dark:border-gray-700">
                          <p className="text-xs text-muted-foreground">Wymagania:</p>
                          {hoveredNode.requirements.map((req, index) => {
                            const reqNode = currentTree.nodes.find(n => n.id === req.nodeId);
                            return (
                              <p key={index} className="text-xs">
                                • {reqNode?.name} lvl {req.minLevel}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Active Effects Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Aktywne Efekty
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Array.from(activeEffects.entries()).map(([type, value]) => (
            <div key={type} className="text-sm">
              <span className="font-medium capitalize">{type.replace(/_/g, ' ')}:</span>
              <span className="ml-1 text-primary">+{value}%</span>
            </div>
          ))}
        </div>
        {activeEffects.size === 0 && (
          <p className="text-sm text-muted-foreground">Brak aktywnych efektów. Odblokuj umiejętności!</p>
        )}
      </div>

      {/* Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Resetuj Drzewo?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Zresetujesz drzewo {currentTree.name} i odzyskasz 80% wydanych punktów.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleResetTree}>Resetuj</Button>
                  <Button variant="outline" onClick={() => setShowResetConfirm(false)}>Anuluj</Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Compact skill points indicator
export function SkillPointsIndicator() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    SkillTreeSystem.loadProgress();
    setPoints(SkillTreeSystem.getSkillPoints());
  }, []);

  if (points === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full"
    >
      <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
        {points} punktów
      </span>
    </motion.div>
  );
}
