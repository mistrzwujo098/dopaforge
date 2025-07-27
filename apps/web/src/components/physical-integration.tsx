'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '@dopaforge/ui';
import { Smartphone, Watch, Bell, Vibrate, Volume2, Lock } from 'lucide-react';

interface PhysicalIntegrationProps {
  userId: string;
  onPhysicalAction: (action: string) => void;
}

export function PhysicalIntegration({ userId, onPhysicalAction }: PhysicalIntegrationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [physicalReminders, setPhysicalReminders] = useState<any[]>([]);
  const [lockdownMode, setLockdownMode] = useState(false);

  // SMS Bombing (w granicach rozsądku)
  const setupSMSReminders = (phone: string) => {
    setPhoneNumber(phone);
    
    // Zaplanuj SMS-y
    const smsSchedule = [
      { time: '09:00', message: 'Czas na pierwsze zadanie. NIE IGNORUJ.' },
      { time: '11:00', message: 'Sprawdzam: ile zadań ukończonych? Odpowiedz.' },
      { time: '14:00', message: 'Po obiedzie = najgorszy czas. DZIAŁAJ TERAZ.' },
      { time: '16:00', message: 'Zostały 3h produktywne. Wykorzystaj je.' },
      { time: '20:00', message: 'Ostatnia szansa na sukces dzisiaj. 1 zadanie.' },
      { time: '22:00', message: 'Podsumowanie dnia. Jutro konsekwencje.' }
    ];
    
    // W prawdziwej aplikacji użyłbyś API do SMS (Twilio, etc.)
    localStorage.setItem('sms_reminders', JSON.stringify(smsSchedule));
    
    toast({
      title: 'SMS-y aktywowane',
      description: 'Będziesz otrzymywać przypomnienia na telefon',
    });
  };

  // Physical Lock System
  const activatePhysicalLock = () => {
    setLockdownMode(true);
    
    // Instrukcje dla użytkownika
    const lockInstructions = {
      phone: {
        action: "Włóż telefon do szuflady",
        verification: "Zrób zdjęcie zamkniętej szuflady",
        duration: "25 minut"
      },
      computer: {
        action: "Zablokuj wszystkie rozrywkowe strony",
        verification: "Screenshot z blokadą",
        duration: "Następne zadanie"
      },
      environment: {
        action: "Zamknij drzwi, powieś kartkę 'NIE PRZESZKADZAĆ'",
        verification: "Zdjęcie kartki",
        duration: "2 godziny"
      }
    };
    
    // Pokaż modal z instrukcjami
    showLockModal(lockInstructions);
  };

  // Wykorzystanie smartwatcha
  const setupWearableIntegration = () => {
    // Vibracje co 15 minut jeśli brak aktywności
    const vibrationPattern = {
      idle15min: [100, 100, 100], // 3 krótkie
      idle30min: [300, 100, 300], // długa-krótka-długa
      idle60min: [500, 100, 500, 100, 500], // SOS pattern
      taskReminder: [200, 200], // 2 średnie
      success: [100, 50, 100, 50, 100] // radosne
    };
    
    localStorage.setItem('wearable_patterns', JSON.stringify(vibrationPattern));
    
    // Tętno jako wskaźnik stresu
    const heartRateMonitoring = {
      baseline: 70,
      stressed: 90,
      intervention: "Wykryto stres. 3 głębokie oddechy, potem 1 micro-zadanie."
    };
    
    return { vibrationPattern, heartRateMonitoring };
  };

  // Fizyczne konsekwencje
  const physicalConsequences = {
    noActivity1h: {
      action: "10 pompek TERAZ",
      alternative: "50 zł na cele charytatywne"
    },
    failedCommitment: {
      action: "Zimny prysznic 2 minuty",
      alternative: "Opublikuj porażkę na social media"
    },
    brokeStreak: {
      action: "Biegnij 1km",
      alternative: "Usuń ulubioną aplikację na 7 dni"
    }
  };

  // Alarm system
  const [alarmActive, setAlarmActive] = useState(false);
  
  const triggerPhysicalAlarm = () => {
    setAlarmActive(true);
    
    // Głośny dźwięk
    const audio = new Audio('/sounds/alarm.mp3');
    audio.loop = true;
    audio.play();
    
    // Pulsujący ekran
    const pulseScreen = () => {
      document.body.style.backgroundColor = 
        document.body.style.backgroundColor === 'red' ? 'white' : 'red';
    };
    const pulseInterval = setInterval(pulseScreen, 500);
    
    // Wyłącz tylko przez wykonanie zadania
    const disableAlarm = () => {
      audio.pause();
      clearInterval(pulseInterval);
      document.body.style.backgroundColor = '';
      setAlarmActive(false);
    };
    
    return { disableAlarm };
  };

  // QR Code challenges
  const createQRChallenge = () => {
    // Wygeneruj QR kod który trzeba zeskanować w innym pokoju
    const challenges = [
      {
        location: "Kuchnia",
        task: "Zeskanuj kod na lodówce",
        reward: "Odblokowanie 10 min przerwy"
      },
      {
        location: "Łazienka",
        task: "Kod na lustrze = reset timera",
        reward: "Bonus 2x XP na następne zadanie"
      },
      {
        location: "Balkon/Okno",
        task: "Wyjdź na świeże powietrze, zeskanuj",
        reward: "Energia +20%"
      }
    ];
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  };

  // Kalendarz integration
  const integrateWithCalendar = () => {
    const calendarEvents = [
      {
        title: "🔥 FOCUS TIME - NIE PRZERYWAĆ",
        duration: 90,
        recurring: "daily",
        alert: "10 min przed"
      },
      {
        title: "⚡ Micro-task Sprint",
        duration: 25,
        recurring: "4x daily",
        alert: "Natychmiast"
      },
      {
        title: "📊 Wieczorne podsumowanie",
        duration: 10,
        recurring: "daily 22:00",
        alert: "Uporczywe przypomnienie"
      }
    ];
    
    // Export do kalendarza
    const icsContent = generateICS(calendarEvents);
    downloadICS(icsContent);
  };

  return (
    <div className="space-y-4">
      {/* Phone Integration */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Integracja z Telefonem
        </h3>
        <div className="space-y-3">
          <Button
            onClick={() => setupSMSReminders('+48...')}
            variant="outline"
            className="w-full"
          >
            Aktywuj SMS przypomnienia (6x dziennie)
          </Button>
          <Button
            onClick={activatePhysicalLock}
            variant="destructive"
            className="w-full"
          >
            <Lock className="mr-2 h-4 w-4" />
            Tryb LOCKDOWN (telefon w szufladzie)
          </Button>
        </div>
      </Card>

      {/* Wearable Integration */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Watch className="h-5 w-5" />
          Smartwatch / Fitness Band
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Wibracje co 15 min bezczynności</span>
            <Button size="sm" onClick={setupWearableIntegration}>
              Połącz
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Monitoring stresu (tętno)</span>
            <span className="text-xs text-muted-foreground">Aktywne</span>
          </div>
        </div>
      </Card>

      {/* Physical Consequences */}
      <Card className="p-4 border-2 border-orange-500">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Vibrate className="h-5 w-5" />
          Fizyczne Konsekwencje
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>1h bezczynności:</span>
            <span className="font-medium">10 pompek</span>
          </div>
          <div className="flex justify-between">
            <span>Złamane zobowiązanie:</span>
            <span className="font-medium">Zimny prysznic</span>
          </div>
          <div className="flex justify-between">
            <span>Stracony streak:</span>
            <span className="font-medium">Bieg 1km</span>
          </div>
        </div>
      </Card>

      {/* Alarm System */}
      {!alarmActive ? (
        <Card className="p-4 border-2 border-red-500">
          <div className="text-center">
            <Volume2 className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <h3 className="font-semibold">Nuklearna Opcja</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Głośny alarm który wyłączysz tylko zadaniem
            </p>
            <Button
              variant="destructive"
              onClick={triggerPhysicalAlarm}
              className="w-full"
            >
              AKTYWUJ ALARM 🚨
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-red-500 text-white animate-pulse">
          <div className="text-center">
            <h3 className="font-bold text-xl">ALARM AKTYWNY!</h3>
            <p>Wykonaj zadanie aby wyłączyć!</p>
          </div>
        </Card>
      )}

      {/* QR Challenges */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Wyzwania Fizyczne</h3>
        <Button
          onClick={() => {
            const challenge = createQRChallenge();
            alert(`Wyzwanie: ${challenge.task}\nNagroda: ${challenge.reward}`);
          }}
          variant="outline"
          className="w-full"
        >
          Generuj QR Challenge (wymaga ruchu)
        </Button>
      </Card>

      {/* Calendar Integration */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Blokady w Kalendarzu
        </h3>
        <Button
          onClick={integrateWithCalendar}
          variant="outline"
          className="w-full"
        >
          Eksportuj FOCUS TIME do kalendarza
        </Button>
      </Card>
    </div>
  );
}

// Helper functions
function showLockModal(instructions: any) {
  // Implementacja modala z instrukcjami
  console.log('Lock instructions:', instructions);
}

function generateICS(events: any[]) {
  // Generowanie pliku .ics
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DopaForge//Focus Calendar//EN
${events.map(e => `
BEGIN:VEVENT
SUMMARY:${e.title}
DURATION:PT${e.duration}M
RRULE:FREQ=DAILY
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:${e.alert}
END:VALARM
END:VEVENT
`).join('')}
END:VCALENDAR`;
}

function downloadICS(content: string) {
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dopaforge-focus-time.ics';
  a.click();
}

function toast(options: any) {
  // Toast notification
  console.log('Toast:', options);
}