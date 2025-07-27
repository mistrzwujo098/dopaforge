'use client';

import { useState, useEffect } from 'react';
import { Button } from '@dopaforge/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dopaforge/ui';
import { Bell, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Show prompt if not yet decided
      if (Notification.permission === 'default') {
        const timeout = setTimeout(() => {
          setShowPrompt(true);
        }, 10000); // Show after 10 seconds
        
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Powiadomienia nie są obsługiwane',
        description: 'Twoja przeglądarka nie obsługuje powiadomień',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Register service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          // Service Worker registered successfully
        }

        // Test notification
        new Notification('Powiadomienia DopaForge włączone!', {
          body: 'Będziesz otrzymywać przypomnienia o produktywności',
          icon: '/icon-192.png',
        });

        toast({
          title: 'Powiadomienia włączone',
          description: 'Będziesz otrzymywać przypomnienia na czas',
        });

        // Schedule daily check-ins
        scheduleDailyNotifications();
      } else {
        toast({
          title: 'Powiadomienia zablokowane',
          description: 'Możesz je włączyć w ustawieniach przeglądarki',
          variant: 'destructive',
        });
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się włączyć powiadomień',
        variant: 'destructive',
      });
    }
  };

  const scheduleDailyNotifications = () => {
    // Schedule morning motivation (9 AM)
    const now = new Date();
    const morning = new Date();
    morning.setHours(9, 0, 0, 0);
    
    if (morning <= now) {
      morning.setDate(morning.getDate() + 1);
    }
    
    const morningTimeout = morning.getTime() - now.getTime();
    
    setTimeout(() => {
      new Notification('Dzień dobry! 🌟', {
        body: 'Gotowy na dzisiejsze zadania? Zacznij od szybkiego zwycięstwa!',
        icon: '/icon-192.png',
        tag: 'morning-motivation',
      });
      
      // Reschedule for next day
      setInterval(() => {
        new Notification('Dzień dobry! 🌟', {
          body: 'Gotowy na dzisiejsze zadania? Zacznij od szybkiego zwycięstwa!',
          icon: '/icon-192.png',
          tag: 'morning-motivation',
        });
      }, 24 * 60 * 60 * 1000);
    }, morningTimeout);

    // Schedule afternoon check-in (2 PM)
    const afternoon = new Date();
    afternoon.setHours(14, 0, 0, 0);
    
    if (afternoon <= now) {
      afternoon.setDate(afternoon.getDate() + 1);
    }
    
    const afternoonTimeout = afternoon.getTime() - now.getTime();
    
    setTimeout(() => {
      new Notification('Popołudniowe sprawdzenie 💪', {
        body: 'Jak Twój postęp? Czas na krótką przerwę lub następne zadanie!',
        icon: '/icon-192.png',
        tag: 'afternoon-checkin',
      });
      
      // Reschedule for next day
      setInterval(() => {
        new Notification('Popołudniowe sprawdzenie 💪', {
          body: 'Jak Twój postęp? Czas na krótką przerwę lub następne zadanie!',
          icon: '/icon-192.png',
          tag: 'afternoon-checkin',
        });
      }, 24 * 60 * 60 * 1000);
    }, afternoonTimeout);
  };

  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-sm animate-slide-up shadow-lg z-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Włączyć powiadomienia?</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPrompt(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Otrzymuj przypomnienia na czas, aby pozostać produktywnym i utrzymać serię
        </CardDescription>
        <div className="flex gap-2">
          <Button onClick={requestPermission} size="sm">
            Włącz powiadomienia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrompt(false)}
          >
            Może później
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}