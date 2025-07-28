import { type Database } from '@dopaforge/db';

type Task = Database['public']['Tables']['micro_tasks']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface NotificationConfig {
  morningReminder: boolean;
  afternoonCheckIn: boolean;
  eveningReview: boolean;
  taskReminders: boolean;
  streakReminders: boolean;
  morningTime: string; // HH:MM format
  afternoonTime: string;
  eveningTime: string;
}

const DEFAULT_CONFIG: NotificationConfig = {
  morningReminder: true,
  afternoonCheckIn: true,
  eveningReview: true,
  taskReminders: true,
  streakReminders: true,
  morningTime: '09:00',
  afternoonTime: '14:00',
  eveningTime: '19:00',
};

export class NotificationScheduler {
  private config: NotificationConfig;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Schedule all notifications for a user
  public scheduleUserNotifications(userId: string, profile: UserProfile) {
    this.clearAllTimers();

    if (this.config.morningReminder) {
      this.scheduleMorningReminder(userId, profile);
    }

    if (this.config.afternoonCheckIn) {
      this.scheduleAfternoonCheckIn(userId, profile);
    }

    if (this.config.eveningReview) {
      this.scheduleEveningReview(userId, profile);
    }

    if (this.config.streakReminders && profile.current_streak > 0) {
      this.scheduleStreakReminder(userId, profile);
    }
  }

  // Schedule task-specific reminders
  public scheduleTaskReminder(task: Task, minutesBefore: number = 5) {
    if (!this.config.taskReminders || !task.started_at) return;

    const startTime = new Date(task.started_at);
    const reminderTime = new Date(startTime.getTime() - minutesBefore * 60 * 1000);
    const now = new Date();

    if (reminderTime > now) {
      const timeout = setTimeout(() => {
        this.sendNotification(
          `Przypomnienie: ${task.title}`,
          `Zadanie rozpocznie się za ${minutesBefore} minut`,
          'task-reminder',
          task.id
        );
      }, reminderTime.getTime() - now.getTime());

      this.timers.set(`task-${task.id}`, timeout);
    }
  }

  private scheduleMorningReminder(userId: string, profile: UserProfile) {
    const [hours, minutes] = this.config.morningTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeout = setTimeout(() => {
      const messages = [
        'Dzień dobry! 🌟 Gotowy na nowe wyzwania?',
        'Czas rozpocząć dzień od małego zwycięstwa! 💪',
        'Witaj! Jakie zadanie wykonasz jako pierwsze? 🎯',
        'Nowy dzień, nowe możliwości! Zacznij od mikro-zadania 🚀',
      ];
      
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      this.sendNotification(
        'Poranna motywacja',
        message,
        'morning-reminder',
        userId
      );

      // Reschedule for next day
      this.scheduleMorningReminder(userId, profile);
    }, scheduledTime.getTime() - now.getTime());

    this.timers.set('morning-reminder', timeout);
  }

  private scheduleAfternoonCheckIn(userId: string, profile: UserProfile) {
    const [hours, minutes] = this.config.afternoonTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeout = setTimeout(() => {
      this.sendNotification(
        'Popołudniowe sprawdzenie',
        'Jak Ci idzie? Czas na krótką przerwę lub kolejne zadanie!',
        'afternoon-checkin',
        userId
      );

      // Reschedule for next day
      this.scheduleAfternoonCheckIn(userId, profile);
    }, scheduledTime.getTime() - now.getTime());

    this.timers.set('afternoon-checkin', timeout);
  }

  private scheduleEveningReview(userId: string, profile: UserProfile) {
    const [hours, minutes] = this.config.eveningTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeout = setTimeout(() => {
      this.sendNotification(
        'Wieczorny przegląd',
        'Świetna robota dzisiaj! Sprawdź swoje postępy 📊',
        'evening-review',
        userId
      );

      // Reschedule for next day
      this.scheduleEveningReview(userId, profile);
    }, scheduledTime.getTime() - now.getTime());

    this.timers.set('evening-review', timeout);
  }

  private scheduleStreakReminder(userId: string, profile: UserProfile) {
    // Send reminder at 8 PM if user hasn't completed any tasks today
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeout = setTimeout(async () => {
      // Check if user has completed any tasks today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      // TODO: Check tasks completed today from database
      const hasCompletedTasks = false; // This should be fetched from DB

      if (!hasCompletedTasks) {
        this.sendNotification(
          `Seria ${profile.current_streak} dni w zagrożeniu! 🔥`,
          'Wykonaj choć jedno zadanie, aby utrzymać serię!',
          'streak-reminder',
          userId
        );
      }

      // Reschedule for next day
      this.scheduleStreakReminder(userId, profile);
    }, reminderTime.getTime() - now.getTime());

    this.timers.set('streak-reminder', timeout);
  }

  private sendNotification(
    title: string,
    body: string,
    tag: string,
    data?: string
  ) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag,
        data: data ? { url: data } : undefined,
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        if (data) {
          // Navigate to specific task or page
          window.location.href = data.startsWith('task-') 
            ? `/focus/${data.replace('task-', '')}`
            : '/dashboard';
        }
        notification.close();
      };
    }
  }

  public clearAllTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  public updateConfig(newConfig: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}