// Dark Psychology & Behavioral Manipulation Engine
// Based on: Loss Aversion, Sunk Cost Fallacy, Social Pressure, Artificial Urgency

export interface ProcrastinationProfile {
  panicThreshold: number; // Hours before deadline when user starts working
  selfSabotagePatterns: string[];
  motivationTriggers: string[];
  avoidanceBehaviors: string[];
}

export class DarkPsychologyEngine {
  // Tworzy sztuczną presję czasową
  static createArtificialDeadline(realDeadline: Date): Date {
    const now = new Date();
    const timeLeft = realDeadline.getTime() - now.getTime();
    
    // Skracamy deadline o 30-50% aby wywołać panikę wcześniej
    const artificialTimeLeft = timeLeft * (0.5 + Math.random() * 0.2);
    return new Date(now.getTime() + artificialTimeLeft);
  }

  // Wykorzystuje FOMO (Fear of Missing Out)
  static generateFOMOMessage(): string {
    const messages = [
      "87% użytkowników już ukończyło to zadanie dzisiaj",
      "Twój konkurent właśnie wyprzedził Cię o 2 zadania",
      "Ostatnia szansa - za 15 min stracisz bonus XP",
      "3 osoby z Twojego zespołu czekają na Twoje zadanie",
      "Jeśli nie zaczniesz teraz, stracisz streak",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Wykorzystuje Sunk Cost Fallacy
  static calculateSunkCost(taskStarted: Date): string {
    const minutesInvested = Math.floor((Date.now() - taskStarted.getTime()) / 60000);
    if (minutesInvested > 5) {
      return `Już zainwestowałeś ${minutesInvested} minut - nie zmarnuj tego!`;
    }
    return "";
  }

  // Tworzy sztuczne konsekwencje
  static generateConsequence(): {
    type: 'social' | 'financial' | 'progress';
    message: string;
    severity: number;
  } {
    const consequences = [
      {
        type: 'social' as const,
        message: "Twój profil zostanie oznaczony jako 'Prokrastynator'",
        severity: 3
      },
      {
        type: 'financial' as const,
        message: "Stracisz 50 XP z konta",
        severity: 2
      },
      {
        type: 'progress' as const,
        message: "Cofniesz się o 3 dni w swojej podróży",
        severity: 4
      }
    ];
    return consequences[Math.floor(Math.random() * consequences.length)];
  }

  // Mikromanipulacje - drobne triki psychologiczne
  static getMicroManipulation(context: string): string {
    const manipulations: Record<string, string[]> = {
      'task_avoid': [
        "Tylko 2 minuty - ustaw timer i zobacz co się stanie",
        "Nie musisz skończyć, tylko zacznij",
        "Zrób tylko 10% - to wystarczy na teraz",
      ],
      'scrolling': [
        "Zauważyłem że scrollujesz - może najpierw jedno małe zadanie?",
        "Za każdą minutę scrollowania tracisz 5 XP",
        "Twój mózg błaga o dopaminę - daj mu ją przez wykonanie zadania",
      ],
      'planning_paralysis': [
        "Przestań planować. Wybierz losowe zadanie i DZIAŁAJ",
        "Planowanie to forma prokrastynacji. Czas na akcję",
        "Twój plan jest wystarczająco dobry. START.",
      ]
    };
    
    return manipulations[context]?.[Math.floor(Math.random() * manipulations[context].length)] || "";
  }

  // System kar i nagród oparty na Variable Ratio Reinforcement
  static calculateReward(consistency: number): {
    xp: number;
    surprise: boolean;
    message: string;
  } {
    const baseXP = 10;
    const surprise = Math.random() < 0.15; // 15% szans na niespodziankę
    
    if (surprise) {
      const multiplier = 2 + Math.floor(Math.random() * 8); // 2x-10x
      return {
        xp: baseXP * multiplier,
        surprise: true,
        message: `🎰 JACKPOT! ${multiplier}x mnożnik XP!`
      };
    }
    
    return {
      xp: baseXP + Math.floor(consistency * 5),
      surprise: false,
      message: ""
    };
  }

  // Anti-sabotage patterns
  static detectSelfSabotage(behavior: string): {
    detected: boolean;
    intervention: string;
  } {
    const patterns: Record<string, string> = {
      'over_planning': "Wykryto nadmierne planowanie. STOP. Wybierz 1 zadanie TERAZ.",
      'perfectionism': "Perfekcjonizm to wróg. Zrób na 60% i idź dalej.",
      'task_switching': "Przestań skakać między zadaniami. FOCUS na tym co zacząłeś.",
      'excuse_making': "Bez wymówek. 2 minuty. Start. Teraz.",
      'waiting_for_mood': "Nastrój przychodzi PO działaniu, nie przed. Start.",
    };
    
    if (patterns[behavior]) {
      return {
        detected: true,
        intervention: patterns[behavior]
      };
    }
    
    return { detected: false, intervention: "" };
  }

  // Urgency amplifier - wzmacnia poczucie pilności
  static amplifyUrgency(hoursLeft: number): {
    color: string;
    animation: string;
    message: string;
    sound: string;
  } {
    if (hoursLeft > 24) {
      return {
        color: 'green',
        animation: 'none',
        message: '',
        sound: 'none'
      };
    } else if (hoursLeft > 12) {
      return {
        color: 'yellow',
        animation: 'pulse',
        message: '⚠️ Czas ucieka',
        sound: 'tick'
      };
    } else if (hoursLeft > 6) {
      return {
        color: 'orange',
        animation: 'shake',
        message: '🔥 UWAGA: Zbliża się deadline',
        sound: 'warning'
      };
    } else {
      return {
        color: 'red',
        animation: 'shake-urgent',
        message: '🚨 KRYTYCZNE: Działaj TERAZ albo przegrasz',
        sound: 'alarm'
      };
    }
  }
}

// Commitment Device - mechanizm wymuszający działanie
export class CommitmentDevice {
  static createStake(type: 'social' | 'financial' | 'identity'): {
    setup: string;
    consequence: string;
    escapeBlocker: string;
  } {
    const stakes = {
      social: {
        setup: "Opublikuj swój cel na social media",
        consequence: "Automatyczny post o porażce zostanie opublikowany",
        escapeBlocker: "Nie możesz usunąć posta przez 48h"
      },
      financial: {
        setup: "Zablokuj 100 PLN na koncie",
        consequence: "Pieniądze zostaną przekazane na cele charytatywne",
        escapeBlocker: "Brak możliwości anulowania po potwierdzeniu"
      },
      identity: {
        setup: "Zadeklaruj swoją tożsamość ('Jestem osobą która...')",
        consequence: "Twój profil straci status 'Produktywny'",
        escapeBlocker: "Zmiana tożsamości zablokowana na 30 dni"
      }
    };
    
    return stakes[type];
  }
}

// Behavioral Interrupt System - przerywa wzorce samosabotażu
export class BehavioralInterrupt {
  static detectProcrastinationPattern(
    mouseMovements: number,
    tabSwitches: number,
    timeOnTask: number
  ): {
    pattern: string;
    interrupt: () => void;
  } | null {
    // Wykrywa bezczynność
    if (mouseMovements < 5 && timeOnTask > 60) {
      return {
        pattern: 'idle',
        interrupt: () => {
          alert("WAKE UP! Straciłeś 5 minut. Działaj TERAZ albo stracisz XP.");
        }
      };
    }
    
    // Wykrywa przełączanie zakładek (rozproszenie)
    if (tabSwitches > 3 && timeOnTask < 300) {
      return {
        pattern: 'distracted',
        interrupt: () => {
          if (confirm("Wykryto rozproszenie. Zablokować rozpraszające strony na 25 minut?")) {
            // Implementacja blokady
          }
        }
      };
    }
    
    return null;
  }
}