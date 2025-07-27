// Addiction Engine - Mechanizmy budowania pozytywnego uzależnienia od produktywności

export class AddictionEngine {
  // Variable Ratio Schedule - jak w automatach do gier
  static calculateRewardSchedule(actionsCount: number): {
    isRewardTime: boolean;
    rewardSize: 'small' | 'medium' | 'large' | 'jackpot';
    anticipation: number;
  } {
    // Losowy harmonogram nagród (najbardziej uzależniający)
    const randomChance = Math.random();
    const baseChance = 0.15; // 15% bazowa szansa
    
    // Zwiększ szansę jeśli dawno nie było nagrody
    const actionsSinceLastReward = parseInt(
      localStorage.getItem('actions_since_reward') || '0'
    );
    const droughtMultiplier = Math.min(actionsSinceLastReward * 0.05, 0.5);
    const actualChance = baseChance + droughtMultiplier;
    
    if (randomChance < actualChance) {
      // Określ wielkość nagrody
      const sizeRoll = Math.random();
      let rewardSize: 'small' | 'medium' | 'large' | 'jackpot';
      
      if (sizeRoll < 0.6) rewardSize = 'small';
      else if (sizeRoll < 0.85) rewardSize = 'medium';
      else if (sizeRoll < 0.97) rewardSize = 'large';
      else rewardSize = 'jackpot';
      
      localStorage.setItem('actions_since_reward', '0');
      
      return {
        isRewardTime: true,
        rewardSize,
        anticipation: actionsSinceLastReward * 10 // Większa radość po dłuższym oczekiwaniu
      };
    }
    
    localStorage.setItem('actions_since_reward', (actionsSinceLastReward + 1).toString());
    
    return {
      isRewardTime: false,
      rewardSize: 'small',
      anticipation: actionsSinceLastReward * 5
    };
  }

  // Near-miss mechanics (prawie-wygrane zwiększają motywację)
  static generateNearMiss(): {
    show: boolean;
    message: string;
    nextRewardHint: string;
  } {
    const chance = Math.random();
    
    if (chance < 0.2) { // 20% szans na near-miss
      const messages = [
        {
          message: "Oooo, prawie! Następne zadanie = JACKPOT 🎰",
          nextRewardHint: "Czuję że następna nagroda będzie WIELKA..."
        },
        {
          message: "Byłeś O WŁOS od bonusu x10! Próbuj dalej!",
          nextRewardHint: "System mówi: duża nagroda jest blisko..."
        },
        {
          message: "99% do mega nagrody! Jeszcze jedno zadanie!",
          nextRewardHint: "Następne zadanie ma 73% szans na bonus!"
        }
      ];
      
      return {
        show: true,
        ...messages[Math.floor(Math.random() * messages.length)]
      };
    }
    
    return { show: false, message: '', nextRewardHint: '' };
  }

  // Dopamine Priming - przygotowanie mózgu na nagrodę
  static primeDopamineResponse(upcomingTaskDifficulty: number): {
    primeType: 'visual' | 'audio' | 'text';
    message: string;
    dopamineLevel: number;
  } {
    const primes = {
      easy: {
        primeType: 'text' as const,
        message: "✨ Łatwe = szybka wygrana. Twój mózg to UWIELBIA.",
        dopamineLevel: 3
      },
      medium: {
        primeType: 'visual' as const,
        message: "🎯 Idealne wyzwanie = maksymalna satysfakcja",
        dopamineLevel: 5
      },
      hard: {
        primeType: 'audio' as const,
        message: "🔥 Trudne = EPICKA nagroda czeka!",
        dopamineLevel: 8
      }
    };
    
    if (upcomingTaskDifficulty < 30) return primes.easy;
    if (upcomingTaskDifficulty < 60) return primes.medium;
    return primes.hard;
  }

  // Streak Multiplier z rosnącą stawką
  static calculateStreakPressure(currentStreak: number): {
    multiplier: number;
    riskLevel: string;
    warningMessage: string;
    protectionCost: number;
  } {
    const multiplier = 1 + (currentStreak * 0.1);
    
    if (currentStreak === 0) {
      return {
        multiplier: 1,
        riskLevel: 'none',
        warningMessage: '',
        protectionCost: 0
      };
    } else if (currentStreak < 7) {
      return {
        multiplier,
        riskLevel: 'low',
        warningMessage: `${currentStreak} dni serii. Nie zniszcz tego.`,
        protectionCost: 50 // XP za ochronę streaka
      };
    } else if (currentStreak < 30) {
      return {
        multiplier,
        riskLevel: 'medium',
        warningMessage: `⚠️ ${currentStreak} DNI! Strata = tragedia`,
        protectionCost: 200
      };
    } else {
      return {
        multiplier,
        riskLevel: 'extreme',
        warningMessage: `🚨 ${currentStreak} DNI SERII! NIE MOŻESZ TEGO STRACIĆ!`,
        protectionCost: 500
      };
    }
  }

  // Withdrawal symptoms - objawy odstawienia
  static checkWithdrawalSymptoms(lastActivityHours: number): {
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    symptoms: string[];
    relief: string;
  } {
    if (lastActivityHours < 12) {
      return {
        severity: 'none',
        symptoms: [],
        relief: ''
      };
    } else if (lastActivityHours < 24) {
      return {
        severity: 'mild',
        symptoms: ['Czujesz niepokój?', 'Brakuje Ci czegoś?'],
        relief: 'Jedno zadanie = natychmiastowa ulga'
      };
    } else if (lastActivityHours < 48) {
      return {
        severity: 'moderate',
        symptoms: [
          'Poziom dopaminy krytycznie niski',
          'Mózg domaga się stymulacji',
          'Koncentracja spada'
        ],
        relief: '2 zadania = powrót do normy'
      };
    } else {
      return {
        severity: 'severe',
        symptoms: [
          '🚨 OSTRZEŻENIE: Ciężkie odstawienie',
          'Motywacja na ZERO',
          'Prokrastynacja przejęła kontrolę',
          'System reward wyłączony'
        ],
        relief: 'NATYCHMIASTOWA dawka: 3 micro-zadania'
      };
    }
  }

  // Tolerance build-up prevention
  static preventToleranceBuildUp(dailyTasks: number, avgDifficulty: number): {
    adjustment: string;
    newChallenge: string;
    bonusMultiplier: number;
  } {
    // Zapobiegaj przyzwyczajeniu
    if (dailyTasks > 10 && avgDifficulty < 30) {
      return {
        adjustment: 'Za łatwo! Mózg się nudzi.',
        newChallenge: 'Dodaj 1 trudne zadanie dla MEGA dopaminy',
        bonusMultiplier: 3
      };
    } else if (dailyTasks < 3) {
      return {
        adjustment: 'Za mało! Głód dopaminowy.',
        newChallenge: 'Minimum 5 zadań = optymalny poziom',
        bonusMultiplier: 2
      };
    }
    
    return {
      adjustment: 'Poziom optymalny',
      newChallenge: 'Utrzymaj tempo',
      bonusMultiplier: 1
    };
  }

  // Social proof addiction
  static generateSocialPressure(): {
    message: string;
    comparisonType: 'peer' | 'personal' | 'global';
    urgency: boolean;
  } {
    const pressures = [
      {
        message: "Tomek z Twojego miasta właśnie ukończył 5 zadań. Ty masz 0.",
        comparisonType: 'peer' as const,
        urgency: true
      },
      {
        message: "Wczoraj byłeś lepszy o 300%. Co się stało?",
        comparisonType: 'personal' as const,
        urgency: true
      },
      {
        message: "Jesteś w dolnych 10% użytkowników dzisiaj",
        comparisonType: 'global' as const,
        urgency: true
      },
      {
        message: "3 osoby właśnie Cię wyprzedziły w rankingu",
        comparisonType: 'peer' as const,
        urgency: false
      }
    ];
    
    return pressures[Math.floor(Math.random() * pressures.length)];
  }

  // Micro-dose rewards
  static dispenseMicroReward(): {
    type: 'visual' | 'sound' | 'haptic' | 'points';
    intensity: number;
    message: string;
  } {
    const rewards = [
      {
        type: 'visual' as const,
        intensity: 1,
        message: '✨' // Mała iskierka
      },
      {
        type: 'sound' as const,
        intensity: 2,
        message: '🔔' // Przyjemny dźwięk
      },
      {
        type: 'points' as const,
        intensity: 3,
        message: '+1 XP' // Małe punkty
      }
    ];
    
    // Dawkuj losowo dla nieprzewidywalności
    return rewards[Math.floor(Math.random() * rewards.length)];
  }
}