// System poziomów DopaForge
export interface Level {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  perks: string[];
  badge?: string;
}

export const levels: Level[] = [
  {
    level: 1,
    title: 'Nowicjusz',
    minXP: 0,
    maxXP: 99,
    perks: ['Podstawowy dashboard', 'Tworzenie zadań', 'System XP'],
    badge: '🌱'
  },
  {
    level: 2,
    title: 'Początkujący',
    minXP: 100,
    maxXP: 249,
    perks: ['Statystyki podstawowe', 'Lootbox codzienny'],
    badge: '🌿'
  },
  {
    level: 3,
    title: 'Praktykant',
    minXP: 250,
    maxXP: 499,
    perks: ['Podział zadań przez AI', 'Wykres tygodniowy'],
    badge: '🍃'
  },
  {
    level: 4,
    title: 'Adept',
    minXP: 500,
    maxXP: 749,
    perks: ['Personalizacja interfejsu', 'Eksport danych'],
    badge: '🌳'
  },
  {
    level: 5,
    title: 'Uczeń',
    minXP: 750,
    maxXP: 999,
    perks: ['Wizualizacja przyszłego ja', 'Zaawansowane statystyki'],
    badge: '📚'
  },
  {
    level: 6,
    title: 'Praktyk',
    minXP: 1000,
    maxXP: 1499,
    perks: ['Własne kategorie zadań', 'Historia wszystkich zadań'],
    badge: '⚡'
  },
  {
    level: 7,
    title: 'Specjalista',
    minXP: 1500,
    maxXP: 1999,
    perks: ['Intencje implementacyjne', 'Przypomnienia smart'],
    badge: '🎯'
  },
  {
    level: 8,
    title: 'Ekspert',
    minXP: 2000,
    maxXP: 2999,
    perks: ['Kontrakty zobowiązań', 'Analiza nawyków'],
    badge: '💎'
  },
  {
    level: 9,
    title: 'Profesjonalista',
    minXP: 3000,
    maxXP: 3999,
    perks: ['Tryb zespołowy', 'Udostępnianie postępów'],
    badge: '🏆'
  },
  {
    level: 10,
    title: 'Mistrz',
    minXP: 4000,
    maxXP: 4999,
    perks: ['System nawyków', 'AI Coach podstawowy'],
    badge: '👑'
  },
  {
    level: 11,
    title: 'Wielki Mistrz',
    minXP: 5000,
    maxXP: 6499,
    perks: ['Kalendarz zadań', 'Integracje zewnętrzne'],
    badge: '🌟'
  },
  {
    level: 12,
    title: 'Champion',
    minXP: 6500,
    maxXP: 7999,
    perks: ['Zaawansowany AI Coach', 'Analiza produktywności'],
    badge: '🚀'
  },
  {
    level: 13,
    title: 'Elita',
    minXP: 8000,
    maxXP: 9999,
    perks: ['Własne wyzwania', 'Mentoring innych'],
    badge: '✨'
  },
  {
    level: 14,
    title: 'Legenda',
    minXP: 10000,
    maxXP: 14999,
    perks: ['Pełna personalizacja', 'API dostęp'],
    badge: '🌌'
  },
  {
    level: 15,
    title: 'Mistrz Produktywności',
    minXP: 15000,
    maxXP: 19999,
    perks: ['Wszystkie funkcje odblokowane', 'Status VIP'],
    badge: '🎖️'
  },
  {
    level: 20,
    title: 'Guru',
    minXP: 20000,
    maxXP: 29999,
    perks: ['Ekskluzywne funkcje beta', 'Wpływ na rozwój aplikacji'],
    badge: '🧘'
  },
  {
    level: 25,
    title: 'Arcymistrz',
    minXP: 30000,
    maxXP: 49999,
    perks: ['Lifetime premium', 'Osobisty konsultant'],
    badge: '🏅'
  },
  {
    level: 30,
    title: 'Nemezis Prokrastynacji',
    minXP: 50000,
    maxXP: 99999,
    perks: ['Legendarny status', 'Hall of Fame'],
    badge: '⚔️'
  },
  {
    level: 50,
    title: 'Bóg Produktywności',
    minXP: 100000,
    maxXP: 999999,
    perks: ['Mityczny status', 'Nazwa w credits'],
    badge: '🔱'
  }
];

export function getLevelInfo(xp: number): Level {
  return levels.find(l => xp >= l.minXP && xp <= l.maxXP) || levels[0];
}

export function getNextLevel(xp: number): Level | null {
  const currentLevel = getLevelInfo(xp);
  const nextIndex = levels.findIndex(l => l.level === currentLevel.level) + 1;
  return levels[nextIndex] || null;
}

export function getProgressToNextLevel(xp: number): { current: number; needed: number; percentage: number } {
  const currentLevel = getLevelInfo(xp);
  const nextLevel = getNextLevel(xp);
  
  if (!nextLevel) {
    return { current: 0, needed: 0, percentage: 100 };
  }
  
  const currentInLevel = xp - currentLevel.minXP;
  const neededForNext = nextLevel.minXP - currentLevel.minXP;
  const percentage = Math.round((currentInLevel / neededForNext) * 100);
  
  return {
    current: currentInLevel,
    needed: neededForNext,
    percentage
  };
}

// Funkcje odblokowywane na różnych poziomach
export interface UnlockableFeature {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  category: 'core' | 'advanced' | 'experimental' | 'premium';
  route?: string;
  component?: string;
}

export const unlockableFeatures: UnlockableFeature[] = [
  // Poziom 1 - Podstawy
  {
    id: 'basic-stats',
    name: 'Podstawowe statystyki',
    description: 'Zobacz swoje dzienne postępy',
    requiredLevel: 1,
    category: 'core',
    route: '/stats'
  },
  
  // Poziom 2
  {
    id: 'lootbox',
    name: 'Codzienny Lootbox',
    description: 'Otwieraj codziennie po nagrodę',
    requiredLevel: 2,
    category: 'core',
    component: 'Lootbox'
  },
  
  // Poziom 3
  {
    id: 'ai-breakdown',
    name: 'AI Podział zadań',
    description: 'Pozwól AI podzielić duże zadania',
    requiredLevel: 3,
    category: 'advanced',
    component: 'AITaskBreakdown'
  },
  
  // Poziom 5
  {
    id: 'future-self',
    name: 'Wizualizacja przyszłego ja',
    description: 'Codzienna praktyka motywacyjna',
    requiredLevel: 5,
    category: 'advanced',
    component: 'FutureSelfModal'
  },
  
  // Poziom 7
  {
    id: 'implementation-intentions',
    name: 'Intencje implementacyjne',
    description: 'Twórz skrypty "jeśli-to" dla nawyków',
    requiredLevel: 7,
    category: 'advanced',
    component: 'ImplementationIntentions'
  },
  
  // Poziom 8
  {
    id: 'commitment-contracts',
    name: 'Kontrakty zobowiązań',
    description: 'Publiczne zobowiązania zwiększające motywację',
    requiredLevel: 8,
    category: 'advanced',
    component: 'CommitmentContract'
  },
  
  // Poziom 10
  {
    id: 'habit-system',
    name: 'System nawyków',
    description: 'Zaawansowane śledzenie i budowanie nawyków',
    requiredLevel: 10,
    category: 'advanced',
    route: '/habits'
  },
  
  // Poziom 11
  {
    id: 'calendar-integration',
    name: 'Kalendarz zadań',
    description: 'Planuj zadania w czasie',
    requiredLevel: 11,
    category: 'advanced',
    route: '/calendar'
  },
  
  // Poziom 12
  {
    id: 'ai-coach',
    name: 'AI Coach',
    description: 'Osobisty trener produktywności',
    requiredLevel: 12,
    category: 'experimental',
    route: '/ai-coach'
  },
  
  // Poziom 15
  {
    id: 'team-mode',
    name: 'Tryb zespołowy',
    description: 'Współpracuj i rywalizuj z innymi',
    requiredLevel: 15,
    category: 'experimental',
    route: '/team'
  },
  
  // Poziom 20
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Integruj DopaForge z innymi narzędziami',
    requiredLevel: 20,
    category: 'premium',
    route: '/api'
  }
];

export function getUnlockedFeatures(level: number): UnlockableFeature[] {
  return unlockableFeatures.filter(f => level >= f.requiredLevel);
}

export function getLockedFeatures(level: number): UnlockableFeature[] {
  return unlockableFeatures.filter(f => level < f.requiredLevel);
}

export function getNextUnlock(level: number): UnlockableFeature | null {
  const locked = getLockedFeatures(level);
  return locked.sort((a, b) => a.requiredLevel - b.requiredLevel)[0] || null;
}

// Bonusy XP
export interface XPBonus {
  type: 'streak' | 'speed' | 'perfect_day' | 'milestone' | 'challenge';
  multiplier: number;
  description: string;
}

export const xpBonuses: XPBonus[] = [
  {
    type: 'streak',
    multiplier: 1.1,
    description: 'Bonus za serię dni'
  },
  {
    type: 'speed',
    multiplier: 1.2,
    description: 'Ukończono szybciej niż planowano'
  },
  {
    type: 'perfect_day',
    multiplier: 1.5,
    description: 'Wszystkie zadania ukończone'
  },
  {
    type: 'milestone',
    multiplier: 2.0,
    description: 'Osiągnięto kamień milowy'
  },
  {
    type: 'challenge',
    multiplier: 1.3,
    description: 'Ukończono wyzwanie'
  }
];

export function calculateXPWithBonuses(baseXP: number, bonuses: XPBonus[]): number {
  let totalXP = baseXP;
  
  bonuses.forEach(bonus => {
    totalXP *= bonus.multiplier;
  });
  
  return Math.round(totalXP);
}