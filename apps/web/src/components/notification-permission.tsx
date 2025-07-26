'use client';

import { useState, useEffect } from 'react';
import { Button } from '@dopaforge/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dopaforge/ui/components/card';
import { Bell, X } from 'lucide-react';
import { useToast } from '@dopaforge/ui/hooks/use-toast';

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
        title: 'Notifications not supported',
        description: 'Your browser does not support notifications',
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
          console.log('Service Worker registered:', registration);
        }

        // Test notification
        new Notification('DopaForge Notifications Enabled!', {
          body: 'You\'ll receive reminders to stay productive',
          icon: '/icon-192.png',
        });

        toast({
          title: 'Notifications enabled',
          description: 'You\'ll receive timely reminders',
        });

        // Schedule daily check-ins
        scheduleDailyNotifications();
      } else {
        toast({
          title: 'Notifications blocked',
          description: 'You can enable them in browser settings',
          variant: 'destructive',
        });
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable notifications',
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
      new Notification('Good morning! 🌟', {
        body: 'Ready to tackle today\'s tasks? Start with a quick win!',
        icon: '/icon-192.png',
        tag: 'morning-motivation',
      });
      
      // Reschedule for next day
      setInterval(() => {
        new Notification('Good morning! 🌟', {
          body: 'Ready to tackle today\'s tasks? Start with a quick win!',
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
      new Notification('Afternoon check-in 💪', {
        body: 'How\'s your progress? Time for a quick break or next task!',
        icon: '/icon-192.png',
        tag: 'afternoon-checkin',
      });
      
      // Reschedule for next day
      setInterval(() => {
        new Notification('Afternoon check-in 💪', {
          body: 'How\'s your progress? Time for a quick break or next task!',
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
            <CardTitle className="text-lg">Enable Notifications?</CardTitle>
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
          Get timely reminders to stay productive and maintain your streak
        </CardDescription>
        <div className="flex gap-2">
          <Button onClick={requestPermission} size="sm">
            Enable Notifications
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrompt(false)}
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}