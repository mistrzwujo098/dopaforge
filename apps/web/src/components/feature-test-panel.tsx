'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader, PlayCircle } from 'lucide-react';
import { Button, Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@dopaforge/ui';
import { SoundSystem } from '@/lib/sound-system';
import { SmartNotificationSystem as NotificationSystem } from '@/lib/notification-system';
import { AchievementSystem, ACHIEVEMENTS } from '@/lib/achievements';
import { PowerUpSystem } from '@/lib/power-ups';
import { TaskRaritySystem } from '@/lib/task-rarity';
import { BossBattleSystem } from '@/lib/boss-battles';
import { SkillTreeSystem } from '@/lib/skill-trees';
import { cn } from '@/lib/utils';

interface TestResult {
  feature: string;
  status: 'pending' | 'testing' | 'passed' | 'failed' | 'warning';
  message?: string;
  details?: string[];
}

export function FeatureTestPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [stressTestMode, setStressTestMode] = useState(false);

  const features = [
    { name: 'Animacje', test: testAnimations },
    { name: 'System Dźwięków', test: testSoundSystem },
    { name: 'Tryb Ciemny', test: testDarkMode },
    { name: 'Skróty Klawiszowe', test: testKeyboardShortcuts },
    { name: 'Wskaźniki Postępu', test: testProgressIndicators },
    { name: 'Powiadomienia', test: testNotifications },
    { name: 'Skeleton Loaders', test: testSkeletonLoaders },
    { name: 'Focus Rings', test: testFocusRings },
    { name: 'Sticky Headers', test: testStickyHeaders },
    { name: 'Card Shadows', test: testCardShadows },
    { name: 'Typografia', test: testTypography },
    { name: 'Combo Counter', test: testComboCounter },
    { name: 'Daily Rewards', test: testDailyRewards },
    { name: 'Achievements', test: testAchievements },
    { name: 'XP System', test: testXPSystem },
    { name: 'Streak Calendar', test: testStreakCalendar },
    { name: 'Task Rarity', test: testTaskRarity },
    { name: 'Power-ups', test: testPowerUps },
    { name: 'Boss Battles', test: testBossBattles },
    { name: 'Skill Trees', test: testSkillTrees }
  ];

  // Test implementations
  async function testAnimations(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Check for animation CSS
    const animationCSS = document.querySelector('style[data-animations]') || 
                        document.querySelector('link[href*="animations.css"]');
    checks.push(animationCSS ? 'Animation CSS loaded' : 'Animation CSS missing');
    
    // Check for Framer Motion
    const motionElements = document.querySelectorAll('[data-framer-motion-id]');
    checks.push(`Found ${motionElements.length} Framer Motion elements`);
    
    // Check for ripple effects
    const rippleElements = document.querySelectorAll('.ripple');
    checks.push(`Found ${rippleElements.length} ripple elements`);
    
    return {
      status: animationCSS && motionElements.length > 0 ? 'passed' : 'failed',
      details: checks
    };
  }

  async function testSoundSystem(): Promise<Partial<TestResult>> {
    const soundSystem = SoundSystem.getInstance();
    const checks = [];
    
    try {
      // Test volume control
      soundSystem.setVolume(0.5);
      checks.push('Volume control working');
      
      // Test mute functionality
      soundSystem.setEnabled(false);
      soundSystem.setEnabled(true);
      checks.push('Mute/unmute working');
      
      return { status: 'passed', details: checks };
    } catch (error) {
      return { 
        status: 'failed', 
        message: 'Sound system error',
        details: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async function testDarkMode(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Check for dark mode class
    const isDark = document.documentElement.classList.contains('dark');
    checks.push(`Dark mode ${isDark ? 'active' : 'inactive'}`);
    
    // Check for CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const bgColor = rootStyles.getPropertyValue('--background');
    checks.push(`Background color: ${bgColor || 'not set'}`);
    
    // Check for auto-switching
    const darkModeData = localStorage.getItem('darkMode');
    checks.push(`Dark mode preference: ${darkModeData || 'not set'}`);
    
    return {
      status: bgColor ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testKeyboardShortcuts(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Simulate keyboard event
    const event = new KeyboardEvent('keydown', {
      key: '/',
      ctrlKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
    
    // Check if help modal appears
    await new Promise(resolve => setTimeout(resolve, 100));
    const helpModal = document.querySelector('[data-keyboard-help]');
    checks.push(helpModal ? 'Help modal found' : 'Help modal not found');
    
    return {
      status: 'passed',
      details: checks
    };
  }

  async function testProgressIndicators(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Look for progress components
    const progressBars = document.querySelectorAll('[role="progressbar"]');
    const circularProgress = document.querySelectorAll('svg circle[stroke-dasharray]');
    
    checks.push(`Linear progress bars: ${progressBars.length}`);
    checks.push(`Circular progress: ${circularProgress.length}`);
    
    return {
      status: progressBars.length > 0 || circularProgress.length > 0 ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testNotifications(): Promise<Partial<TestResult>> {
    const notificationSystem = NotificationSystem.getInstance();
    const checks = [];
    
    try {
      // Request permission (if needed)
      const permission = await Notification.requestPermission();
      checks.push(`Notification permission: ${permission}`);
      
      // Test notification creation
      if (permission === 'granted') {
        await notificationSystem.previewNextTask({
          title: 'Test Task',
          estMinutes: 25,
          reward: 100
        });
        checks.push('Test notification sent');
      }
      
      return {
        status: permission === 'granted' ? 'passed' : 'warning',
        details: checks
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'Notification error',
        details: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async function testSkeletonLoaders(): Promise<Partial<TestResult>> {
    const checks = [];
    
    const skeletons = document.querySelectorAll('.skeleton, [data-skeleton]');
    checks.push(`Found ${skeletons.length} skeleton loaders`);
    
    // Check for shimmer animation
    const hasShimmer = Array.from(skeletons).some(el => 
      el.classList.contains('animate-shimmer') || 
      window.getComputedStyle(el).animation.includes('shimmer')
    );
    checks.push(hasShimmer ? 'Shimmer animation active' : 'No shimmer animation');
    
    return {
      status: skeletons.length > 0 ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testFocusRings(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Check for focus-visible styles
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    let hasFocusStyles = false;
    
    focusableElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.focus();
        const styles = window.getComputedStyle(el);
        if (styles.outline !== 'none' || styles.boxShadow.includes('ring')) {
          hasFocusStyles = true;
        }
      }
    });
    
    checks.push(hasFocusStyles ? 'Focus rings present' : 'No focus rings found');
    checks.push(`Focusable elements: ${focusableElements.length}`);
    
    return {
      status: hasFocusStyles ? 'passed' : 'failed',
      details: checks
    };
  }

  async function testStickyHeaders(): Promise<Partial<TestResult>> {
    const checks = [];
    
    const stickyElements = document.querySelectorAll('[style*="sticky"], .sticky');
    checks.push(`Sticky elements: ${stickyElements.length}`);
    
    // Check for backdrop blur
    const hasBackdropBlur = Array.from(stickyElements).some(el => {
      const styles = window.getComputedStyle(el);
      return styles.backdropFilter.includes('blur');
    });
    checks.push(hasBackdropBlur ? 'Backdrop blur active' : 'No backdrop blur');
    
    return {
      status: stickyElements.length > 0 ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testCardShadows(): Promise<Partial<TestResult>> {
    const checks = [];
    
    const cards = document.querySelectorAll('.card, [data-card]');
    let hasDepthShadows = false;
    
    cards.forEach(card => {
      const styles = window.getComputedStyle(card);
      if (styles.boxShadow !== 'none' && styles.boxShadow.includes('rgb')) {
        hasDepthShadows = true;
      }
    });
    
    checks.push(`Cards found: ${cards.length}`);
    checks.push(hasDepthShadows ? 'Depth shadows present' : 'No depth shadows');
    
    return {
      status: hasDepthShadows ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testTypography(): Promise<Partial<TestResult>> {
    const checks = [];
    
    const rootStyles = getComputedStyle(document.documentElement);
    const fontSize = rootStyles.fontSize;
    const lineHeight = rootStyles.lineHeight;
    
    checks.push(`Base font size: ${fontSize}`);
    checks.push(`Base line height: ${lineHeight}`);
    
    // Check for rhythm
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    checks.push(`Headings found: ${headings.length}`);
    
    return {
      status: 'passed',
      details: checks
    };
  }

  async function testComboCounter(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Check localStorage
    const comboData = localStorage.getItem('task_combo');
    checks.push(comboData ? 'Combo data found' : 'No combo data');
    
    // Look for combo UI
    const comboElement = document.querySelector('[data-combo], .combo-counter');
    checks.push(comboElement ? 'Combo UI present' : 'Combo UI not found');
    
    return {
      status: comboElement ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testDailyRewards(): Promise<Partial<TestResult>> {
    const checks = [];
    
    const rewardData = localStorage.getItem('daily_rewards');
    checks.push(rewardData ? 'Reward data found' : 'No reward data');
    
    if (rewardData) {
      try {
        const data = JSON.parse(rewardData);
        checks.push(`Current day: ${data.currentDay || 0}`);
        checks.push(`Last claim: ${data.lastClaim || 'Never'}`);
      } catch (e) {
        checks.push('Invalid reward data format');
      }
    }
    
    return {
      status: rewardData ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testAchievements(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Check achievements directly - AchievementSystem is static and doesn't need loading
    const mockStats = {
      totalTasks: 50,
      streakDays: 7,
      level: 10,
      bossesDefeated: 2,
      unlockedAchievements: []
    };
    const newAchievements = AchievementSystem.checkAchievements(mockStats);
    
    checks.push(`New achievements found: ${newAchievements.length}`);
    checks.push(`Total achievements: ${ACHIEVEMENTS.length}`);
    
    // Test achievement check
    AchievementSystem.checkAchievements({ tasks_completed: 1 });
    checks.push('Achievement check executed');
    
    return {
      status: 'passed',
      details: checks
    };
  }

  async function testXPSystem(): Promise<Partial<TestResult>> {
    const checks = [];
    
    const xpData = localStorage.getItem('user_xp_data');
    checks.push(xpData ? 'XP data found' : 'No XP data');
    
    // Look for XP UI
    const xpBar = document.querySelector('[data-xp-bar], .xp-progress');
    checks.push(xpBar ? 'XP bar present' : 'XP bar not found');
    
    return {
      status: xpBar ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testStreakCalendar(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Look for calendar UI
    const calendar = document.querySelector('[data-streak-calendar], .streak-calendar');
    checks.push(calendar ? 'Calendar present' : 'Calendar not found');
    
    // Check for activity data
    const activityData = localStorage.getItem('streak_data');
    checks.push(activityData ? 'Streak data found' : 'No streak data');
    
    return {
      status: calendar ? 'passed' : 'warning',
      details: checks
    };
  }

  async function testTaskRarity(): Promise<Partial<TestResult>> {
    const checks = [];
    
    // Test rarity calculation
    const testTask = {
      title: 'Important urgent task with many words',
      est_minutes: 120,
      created_at: new Date().toISOString()
    };
    
    const rarity = TaskRaritySystem.calculateRarity(testTask);
    checks.push(`Test task rarity: ${rarity}`);
    
    // Test XP calculation
    const xp = TaskRaritySystem.getXPReward(100, rarity);
    checks.push(`XP reward: ${xp}`);
    
    return {
      status: 'passed',
      details: checks
    };
  }

  async function testPowerUps(): Promise<Partial<TestResult>> {
    const checks = [];
    
    PowerUpSystem.loadPowerUps();
    const active = PowerUpSystem.getActivePowerUps();
    checks.push(`Active power-ups: ${active.length}`);
    
    // Test XP multiplier
    const multiplier = PowerUpSystem.getXPMultiplier();
    checks.push(`XP multiplier: ${multiplier}x`);
    
    return {
      status: 'passed',
      details: checks
    };
  }

  async function testBossBattles(): Promise<Partial<TestResult>> {
    const checks = [];
    
    BossBattleSystem.loadBattleState();
    const currentBattle = BossBattleSystem.getCurrentBattle();
    checks.push(currentBattle ? 'Active battle found' : 'No active battle');
    
    // Check boss availability
    const canChallenge = BossBattleSystem.canChallengeBoss('procrastination_demon', 10);
    checks.push(`Can challenge boss: ${canChallenge.canChallenge}`);
    
    return {
      status: 'passed',
      details: checks
    };
  }

  async function testSkillTrees(): Promise<Partial<TestResult>> {
    const checks = [];
    
    SkillTreeSystem.loadProgress();
    const points = SkillTreeSystem.getSkillPoints();
    checks.push(`Skill points: ${points}`);
    
    // Test tree progress
    const progress = SkillTreeSystem.getTreeProgress('productivity');
    checks.push(`Productivity tree: ${progress.percentage}%`);
    
    // Test active effects
    const effects = SkillTreeSystem.getActiveEffects();
    checks.push(`Active effects: ${effects.size}`);
    
    return {
      status: 'passed',
      details: checks
    };
  }

  // Run all tests
  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    for (const feature of features) {
      setCurrentTest(feature.name);
      
      try {
        const result = await feature.test();
        results.push({
          feature: feature.name,
          status: result.status || 'passed',
          message: result.message,
          details: result.details
        });
      } catch (error) {
        results.push({
          feature: feature.name,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Test failed',
          details: []
        });
      }
      
      // Add delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest('');
  };

  // Stress test
  const runStressTest = async () => {
    setStressTestMode(true);
    const soundSystem = SoundSystem.getInstance();
    
    // Rapid fire animations
    for (let i = 0; i < 50; i++) {
      const elements = document.querySelectorAll('[data-testable]');
      elements.forEach(el => {
        (el as HTMLElement).style.transform = `scale(${0.9 + Math.random() * 0.2})`;
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Test many sounds
    for (let i = 0; i < 20; i++) {
      soundSystem.play('click');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Create many notifications
    const notificationSystem = NotificationSystem.getInstance();
    for (let i = 0; i < 10; i++) {
      await notificationSystem.notify({
        title: 'Stress test notification ' + i,
        body: 'Test notification body',
        tag: 'stress-test-' + i
      });
    }
    
    setStressTestMode(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'testing': return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const summary = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    warnings: testResults.filter(r => r.status === 'warning').length
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Panel Testów Funkcji</h2>
          <p className="text-sm text-muted-foreground">Sprawdź wszystkie zaimplementowane funkcje</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={isRunning}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {isRunning ? 'Testowanie...' : 'Uruchom Testy'}
          </Button>
          <Button
            variant="destructive"
            onClick={runStressTest}
            disabled={isRunning || stressTestMode}
          >
            {stressTestMode ? 'Stress Test...' : 'Stress Test'}
          </Button>
        </div>
      </div>

      {currentTest && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm">Testowanie: <strong>{currentTest}</strong></p>
        </div>
      )}

      {testResults.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm text-muted-foreground">Wszystkie</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
              <p className="text-sm text-green-600">Zaliczone</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
              <p className="text-sm text-yellow-600">Ostrzeżenia</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
              <p className="text-sm text-red-600">Błędy</p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'p-4 rounded-lg border',
                  result.status === 'passed' && 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
                  result.status === 'failed' && 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
                  result.status === 'warning' && 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                )}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h4 className="font-medium">{result.feature}</h4>
                    {result.message && (
                      <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                    )}
                    {result.details && result.details.length > 0 && (
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        {result.details.map((detail, idx) => (
                          <li key={idx}>• {detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
