'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock } from 'lucide-react';
import { Button } from '@dopaforge/ui';

interface NotificationPreview {
  id: string;
  title: string;
  body: string;
  icon?: React.ReactNode;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  }>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
}

export function NotificationPreviewSystem() {
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-hide after timeout
  useEffect(() => {
    const timers = notifications.map((notif) => {
      if (notif.priority !== 'urgent') {
        const timeout = notif.priority === 'high' ? 8000 : 5000;
        return setTimeout(() => {
          removeNotification(notif.id);
        }, timeout);
      }
      return null;
    });

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [notifications]);

  const addNotification = (notification: Omit<NotificationPreview, 'id' | 'timestamp'>) => {
    const newNotif: NotificationPreview = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5)); // Max 5
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;

  return (
    <>
      {/* Notification indicator */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                urgentCount > 0 ? 'bg-red-500' : 'bg-blue-500'
              }`}
            >
              {notifications.length}
            </motion.span>
          )}
        </Button>
      </div>

      {/* Notification stack */}
      <div className="fixed top-16 right-4 z-50 w-96 pointer-events-none">
        <AnimatePresence>
          {(isExpanded ? notifications : notifications.slice(0, 1)).map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                y: isExpanded ? index * 10 : 0,
                scale: isExpanded ? 1 - index * 0.02 : 1
              }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`mb-3 pointer-events-auto ${
                isExpanded && index > 0 ? 'opacity-90' : ''
              }`}
            >
              <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden ${
                notif.priority === 'urgent' ? 'border-red-500' :
                notif.priority === 'high' ? 'border-orange-500' :
                'border-gray-200 dark:border-gray-700'
              }`}>
                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {notif.icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        {notif.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{notif.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notif.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notif.id)}
                      className="p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                {notif.actions && notif.actions.length > 0 && (
                  <div className="border-t dark:border-gray-700 p-2 flex gap-2">
                    {notif.actions.map((action, i) => (
                      <Button
                        key={i}
                        variant={action.variant || 'ghost'}
                        size="sm"
                        onClick={() => {
                          action.action();
                          removeNotification(notif.id);
                        }}
                        className="flex-1"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Teraz';
  if (minutes < 60) return `${minutes}m temu`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h temu`;
  
  return date.toLocaleDateString();
}