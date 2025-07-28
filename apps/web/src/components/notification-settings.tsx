'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Switch,
  Label,
  Input,
  Button
} from '@dopaforge/ui';
import { Bell, Clock, Calendar, Zap } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { NotificationScheduler, type NotificationConfig } from '@/lib/notification-scheduler';
import { t } from '@/lib/i18n';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface NotificationSettingsProps {
  userId: string;
  userProfile: any;
}

export function NotificationSettings({ userId, userProfile }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [scheduler, setScheduler] = useState<NotificationScheduler | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [config, setConfig] = useState<NotificationConfig>({
    morningReminder: true,
    afternoonCheckIn: true,
    eveningReview: true,
    taskReminders: true,
    streakReminders: true,
    morningTime: '09:00',
    afternoonTime: '14:00',
    eveningTime: '19:00',
  });

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved config
    const savedConfig = localStorage.getItem('notification_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      const newScheduler = new NotificationScheduler(parsed);
      setScheduler(newScheduler);
      
      if (Notification.permission === 'granted') {
        newScheduler.scheduleUserNotifications(userId, userProfile);
      }
    } else {
      const newScheduler = new NotificationScheduler(config);
      setScheduler(newScheduler);
    }

    return () => {
      scheduler?.clearAllTimers();
    };
  }, []);

  const handleConfigChange = (key: keyof NotificationConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem('notification_config', JSON.stringify(newConfig));
    
    if (scheduler) {
      scheduler.updateConfig(newConfig);
      if (permission === 'granted') {
        scheduler.scheduleUserNotifications(userId, userProfile);
      }
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: t('common.error'),
        description: 'Twoja przeglądarka nie obsługuje powiadomień',
        variant: 'destructive',
      });
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      toast({
        title: 'Powiadomienia włączone',
        description: 'Będziesz otrzymywać przypomnienia',
      });
      
      if (scheduler) {
        scheduler.scheduleUserNotifications(userId, userProfile);
      }
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {permission !== 'granted' && (
        <motion.div variants={staggerItem}>
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Włącz powiadomienia
              </CardTitle>
              <CardDescription>
                Powiadomienia są wyłączone. Włącz je, aby otrzymywać przypomnienia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={requestPermission} variant="gradient">
                Włącz powiadomienia
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Codzienne przypomnienia
            </CardTitle>
            <CardDescription>
              Ustaw godziny, w których chcesz otrzymywać przypomnienia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="morning-reminder">Poranne przypomnienie</Label>
                <p className="text-sm text-muted-foreground">
                  Motywacja na początek dnia
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={config.morningTime}
                  onChange={(e) => handleConfigChange('morningTime', e.target.value)}
                  className="w-24"
                  disabled={!config.morningReminder}
                />
                <Switch
                  id="morning-reminder"
                  checked={config.morningReminder}
                  onCheckedChange={(checked) => handleConfigChange('morningReminder', checked)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="afternoon-checkin">Popołudniowe sprawdzenie</Label>
                <p className="text-sm text-muted-foreground">
                  Przypomnienie o postępach
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={config.afternoonTime}
                  onChange={(e) => handleConfigChange('afternoonTime', e.target.value)}
                  className="w-24"
                  disabled={!config.afternoonCheckIn}
                />
                <Switch
                  id="afternoon-checkin"
                  checked={config.afternoonCheckIn}
                  onCheckedChange={(checked) => handleConfigChange('afternoonCheckIn', checked)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="evening-review">Wieczorny przegląd</Label>
                <p className="text-sm text-muted-foreground">
                  Podsumowanie dnia
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={config.eveningTime}
                  onChange={(e) => handleConfigChange('eveningTime', e.target.value)}
                  className="w-24"
                  disabled={!config.eveningReview}
                />
                <Switch
                  id="evening-review"
                  checked={config.eveningReview}
                  onCheckedChange={(checked) => handleConfigChange('eveningReview', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Inne powiadomienia
            </CardTitle>
            <CardDescription>
              Przypomnienia o zadaniach i seriach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-reminders">Przypomnienia o zadaniach</Label>
                <p className="text-sm text-muted-foreground">
                  5 minut przed zaplanowanym zadaniem
                </p>
              </div>
              <Switch
                id="task-reminders"
                checked={config.taskReminders}
                onCheckedChange={(checked) => handleConfigChange('taskReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="streak-reminders">Przypomnienia o serii</Label>
                <p className="text-sm text-muted-foreground">
                  Gdy seria jest zagrożona
                </p>
              </div>
              <Switch
                id="streak-reminders"
                checked={config.streakReminders}
                onCheckedChange={(checked) => handleConfigChange('streakReminders', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}