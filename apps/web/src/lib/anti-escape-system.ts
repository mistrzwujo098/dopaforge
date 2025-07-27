// Anti-Escape System - Blokuje typowe ucieczki prokrastynatorów

export class AntiEscapeSystem {
  // Blokada "Jutro zacznę od nowa"
  static preventFreshStartFallacy(userId: string): {
    blocked: boolean;
    message: string;
    penalty: number;
  } {
    const lastReset = localStorage.getItem(`last_reset_${userId}`);
    const resetCount = parseInt(localStorage.getItem(`reset_count_${userId}`) || '0');
    
    if (lastReset) {
      const hoursSinceReset = (Date.now() - parseInt(lastReset)) / 3600000;
      
      if (hoursSinceReset < 24) {
        return {
          blocked: true,
          message: "NIE. Żadnego 'od jutra'. Kontynuujesz TERAZ albo tracisz wszystko.",
          penalty: resetCount * 100 // Rosnąca kara XP
        };
      }
    }
    
    return { blocked: false, message: '', penalty: 0 };
  }

  // Wykrywanie i blokowanie "trybu planowania"
  static detectPlanningMode(actions: string[]): {
    inPlanningTrap: boolean;
    intervention: string;
  } {
    const planningActions = actions.filter(a => 
      a.includes('edit') || a.includes('reorganize') || a.includes('plan')
    );
    
    if (planningActions.length > 3) { // More than 3 planning actions in the last 10 actions
      return {
        inPlanningTrap: true,
        intervention: "STOP. Wykryto pułapkę planowania. Wybierz JEDNO zadanie i WYKONAJ je."
      };
    }
    
    return { inPlanningTrap: false, intervention: '' };
  }

  // Blokada "Poczekam aż będę miał więcej czasu"
  static blockTimeExcuse(): string[] {
    return [
      "Masz 2 minuty? To wystarczy. START.",
      "Wielkie bloki czasu to mit. Działaj w 5-minutowych sprintach.",
      "Czekasz na 'idealny moment'? On nie istnieje. Jest tylko TERAZ.",
      "Każda minuta czekania = -10 XP. Licznik już działa."
    ];
  }

  // System "No Zero Days"
  static enforceNoZeroDays(lastActivityDate: Date): {
    hoursLeft: number;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    consequences: string[];
  } {
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59);
    
    const hoursLeft = (todayEnd.getTime() - now.getTime()) / 3600000;
    const todayActivity = lastActivityDate.toDateString() === now.toDateString();
    
    if (todayActivity) {
      return {
        hoursLeft,
        urgencyLevel: 'low',
        message: '',
        consequences: []
      };
    }
    
    if (hoursLeft > 6) {
      return {
        hoursLeft,
        urgencyLevel: 'medium',
        message: `${Math.floor(hoursLeft)} godzin do końca dnia. Nie pozwól mu być zerem.`,
        consequences: ['Stracisz streak', 'Reset do poziomu 1']
      };
    } else if (hoursLeft > 2) {
      return {
        hoursLeft,
        urgencyLevel: 'high',
        message: `UWAGA: Tylko ${Math.floor(hoursLeft)} godziny! Ratuj dzień!`,
        consequences: ['Stracisz streak', 'Stracisz 50% XP', 'Blokada funkcji na 24h']
      };
    } else {
      return {
        hoursLeft,
        urgencyLevel: 'critical',
        message: `🚨 KRYTYCZNE: ${Math.floor(hoursLeft * 60)} MINUT! DZIAŁAJ NATYCHMIAST!`,
        consequences: ['RESET KONTA', 'Utrata WSZYSTKICH postępów', 'Ponowny onboarding']
      };
    }
  }

  // Wykrywanie "Fake Work" (udawanie pracy)
  static detectFakeWork(taskPattern: {
    title: string;
    duration: number;
    completed: boolean;
  }[]): {
    isFakeWork: boolean;
    evidence: string[];
    penalty: string;
  } {
    const suspiciousPatterns = [];
    
    // Zbyt krótkie "zadania"
    const tooShortTasks = taskPattern.filter(t => t.duration < 2 && t.completed);
    if (tooShortTasks.length > 3) {
      suspiciousPatterns.push("Zadania <2 min to nie praca, to udawanie");
    }
    
    // Te same zadania codziennie
    const duplicateTitles = taskPattern.map(t => t.title)
      .filter((title, index, self) => self.indexOf(title) !== index);
    if (duplicateTitles.length > 0) {
      suspiciousPatterns.push("Powtarzasz te same 'zadania' - to nie postęp");
    }
    
    // Zadania bez konkretnego celu
    const vagueTaskWords = ['sprawdzić', 'przejrzeć', 'pomyśleć', 'zaplanować'];
    const vagueTasks = taskPattern.filter(t => 
      vagueTaskWords.some(word => t.title.toLowerCase().includes(word))
    );
    if (vagueTasks.length > taskPattern.length * 0.3) {
      suspiciousPatterns.push("Za dużo 'miękkich' zadań - gdzie konkretne działania?");
    }
    
    return {
      isFakeWork: suspiciousPatterns.length > 0,
      evidence: suspiciousPatterns,
      penalty: "Zadania zostaną oznaczone jako FAKE. -50 XP za każde."
    };
  }

  // Blokada "App Hopping" (skakanie między aplikacjami)
  static preventAppHopping(): {
    message: string;
    lockDuration: number;
  } {
    const appSwitches = parseInt(localStorage.getItem('app_switches') || '0');
    
    if (appSwitches > 5) {
      return {
        message: "Przestań szukać 'idealnej' aplikacji. Problem nie jest w narzędziu - jest w Tobie.",
        lockDuration: 3600000 // 1 godzina blokady
      };
    }
    
    return { message: '', lockDuration: 0 };
  }

  // System "Prokrastynacja przez perfekcjonizm"
  static breakPerfectionism(taskEdits: number, timeSpent: number): {
    detected: boolean;
    intervention: string;
    forceAction: () => void;
  } {
    const editsPerMinute = taskEdits / (timeSpent / 60);
    
    if (editsPerMinute > 0.5 || taskEdits > 5) {
      return {
        detected: true,
        intervention: "Perfekcjonizm wykryty. Wersja 'wystarczająco dobra' > idealna która nie istnieje.",
        forceAction: () => {
          // Zablokuj edycję na 30 minut
          localStorage.setItem('edit_blocked_until', (Date.now() + 1800000).toString());
          alert("Edycja ZABLOKOWANA na 30 minut. Działaj z tym co masz.");
        }
      };
    }
    
    return { detected: false, intervention: '', forceAction: () => {} };
  }

  // Wykrywanie "Decision Fatigue"
  static detectDecisionFatigue(
    decisionsToday: number,
    tasksSwitched: number
  ): {
    fatigued: boolean;
    solution: string;
    autoAction: () => void;
  } {
    if (decisionsToday > 10 || tasksSwitched > 5) {
      return {
        fatigued: true,
        solution: "Za dużo decyzji. System wybiera za Ciebie.",
        autoAction: () => {
          // Automatycznie wybierz zadanie
          const tasks = document.querySelectorAll('[data-task-pending]');
          if (tasks.length > 0) {
            const randomTask = tasks[Math.floor(Math.random() * tasks.length)] as HTMLElement;
            randomTask.click();
            alert("Zadanie wybrane. Nie myśl. Działaj.");
          }
        }
      };
    }
    
    return { fatigued: false, solution: '', autoAction: () => {} };
  }

  // Blokada "Mood Waiting" (czekanie na odpowiedni nastrój)
  static destroyMoodExcuse(): {
    truth: string;
    scientificFact: string;
    immediateAction: string;
  } {
    const truths = [
      {
        truth: "Nastrój to EFEKT działania, nie warunek wstępny.",
        scientificFact: "Badania: 94% osób czuje się lepiej PO rozpoczęciu zadania.",
        immediateAction: "Timer 2 minuty. Start. Nastrój przyjdzie sam."
      },
      {
        truth: "Czekasz na motywację? Ona przychodzi z MOMENTUM.",
        scientificFact: "Neurobiologia: Działanie → Dopamina → Motywacja (nie odwrotnie!)",
        immediateAction: "Jedno micro-działanie. 30 sekund. TERAZ."
      },
      {
        truth: "'Nie czuję się na siłach' = Twój mózg Cię okłamuje.",
        scientificFact: "Każde działanie buduje self-efficacy. Bezczynność ją niszczy.",
        immediateAction: "Udowodnij mózgowi że się myli. 1 zadanie."
      }
    ];
    
    return truths[Math.floor(Math.random() * truths.length)];
  }
}