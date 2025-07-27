'use client';

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationGroup {
  tag: string;
  notifications: NotificationOptions[];
  priority: number;
}

export class SmartNotificationSystem {
  private static instance: SmartNotificationSystem;
  private permission: NotificationPermission = 'default';
  private groups: Map<string, NotificationGroup> = new Map();
  private queue: NotificationOptions[] = [];

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): SmartNotificationSystem {
    if (!SmartNotificationSystem.instance) {
      SmartNotificationSystem.instance = new SmartNotificationSystem();
    }
    return SmartNotificationSystem.instance;
  }

  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      // Browser does not support notifications
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  // Smart notification with preview and actions
  async notify(options: NotificationOptions) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    // Group similar notifications
    if (options.tag) {
      this.addToGroup(options);
    }

    // Create rich notification
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/badge-72x72.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || options.priority === 'urgent',
      silent: options.silent || false
    });

    // Handle clicks
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      this.handleNotificationClick(options);
      notification.close();
    };

    // Auto-close based on priority
    if (!options.requireInteraction) {
      const timeout = this.getTimeoutByPriority(options.priority);
      setTimeout(() => notification.close(), timeout);
    }

    return notification;
  }

  // Preview next task
  async previewNextTask(task: { title: string; estMinutes: number; reward: number }) {
    await this.notify({
      title: '⏭️ Następne zadanie',
      body: `${task.title} (${task.estMinutes} min) • +${task.reward} XP`,
      tag: 'next-task',
      priority: 'normal',
      actions: [
        { action: 'start', title: '▶️ Start' },
        { action: 'snooze', title: '⏰ Za 5 min' }
      ],
      data: { taskId: task }
    });
  }

  // Combo notification
  async notifyCombo(comboCount: number, nextReward: string) {
    await this.notify({
      title: `🔥 Combo x${comboCount}!`,
      body: `Nie przerywaj! Następna nagroda: ${nextReward}`,
      tag: 'combo',
      priority: 'high',
      requireInteraction: false
    });
  }

  // Warning notification
  async notifyWarning(message: string, urgency: 'low' | 'normal' | 'high' | 'urgent' = 'normal') {
    await this.notify({
      title: '⚠️ Uwaga',
      body: message,
      tag: 'warning',
      priority: urgency,
      requireInteraction: urgency === 'urgent'
    });
  }

  // Achievement notification
  async notifyAchievement(achievement: { name: string; description: string; reward: number }) {
    await this.notify({
      title: '🏆 Nowe osiągnięcie!',
      body: `${achievement.name}: ${achievement.description} (+${achievement.reward} XP)`,
      tag: 'achievement',
      priority: 'high',
      requireInteraction: true,
      actions: [
        { action: 'view', title: '👀 Zobacz' },
        { action: 'share', title: '📤 Udostępnij' }
      ]
    });
  }

  // Group notifications intelligently
  private addToGroup(notification: NotificationOptions) {
    const group = this.groups.get(notification.tag!) || {
      tag: notification.tag!,
      notifications: [],
      priority: this.getPriorityValue(notification.priority)
    };

    group.notifications.push(notification);
    this.groups.set(notification.tag!, group);

    // If too many in group, create summary
    if (group.notifications.length >= 3) {
      this.createGroupSummary(group);
    }
  }

  private createGroupSummary(group: NotificationGroup) {
    const summaryTitles: Record<string, string> = {
      'task': '📋 Zadania',
      'achievement': '🏆 Osiągnięcia',
      'warning': '⚠️ Ostrzeżenia',
      'combo': '🔥 Combo'
    };

    const title = summaryTitles[group.tag] || 'Powiadomienia';
    const body = `Masz ${group.notifications.length} nowych powiadomień`;

    this.notify({
      title,
      body,
      tag: `${group.tag}-summary`,
      priority: 'normal',
      data: { notifications: group.notifications }
    });

    // Clear group
    this.groups.delete(group.tag);
  }

  private handleNotificationClick(options: NotificationOptions) {
    // Handle different notification types
    switch (options.tag) {
      case 'next-task':
        // Navigate to task
        if (options.data?.taskId) {
          window.location.href = `/focus/${options.data.taskId}`;
        }
        break;
      case 'achievement':
        // Open achievements
        window.location.href = '/achievements';
        break;
      default:
        // Default action
        break;
    }
  }

  private getPriorityValue(priority?: string): number {
    const values = {
      'low': 1,
      'normal': 2,
      'high': 3,
      'urgent': 4
    };
    return values[priority as keyof typeof values] || 2;
  }

  private getTimeoutByPriority(priority?: string): number {
    const timeouts = {
      'low': 3000,
      'normal': 5000,
      'high': 8000,
      'urgent': 0 // Don't auto-close
    };
    return timeouts[priority as keyof typeof timeouts] || 5000;
  }

  // Batch notifications
  async notifyBatch(notifications: NotificationOptions[]) {
    // Sort by priority
    const sorted = notifications.sort((a, b) => 
      this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority)
    );

    // Show top 3 immediately
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      await this.notify(sorted[i]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }

    // Queue the rest
    if (sorted.length > 3) {
      this.queue.push(...sorted.slice(3));
      this.processQueue();
    }
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      const notification = this.queue.shift()!;
      await this.notify(notification);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s between queued
    }
  }
}