import { useEffect } from 'react';
import { supabase } from '@dopaforge/db';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeSyncOptions {
  userId: string;
  onTasksChange?: () => void;
  onProfileChange?: () => void;
}

export function useRealtimeSync({ userId, onTasksChange, onProfileChange }: UseRealtimeSyncOptions) {
  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      // Subscribe to changes for user's tasks
      channel = supabase
        .channel(`user-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'micro_tasks',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            // Task change detected
            onTasksChange?.();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            // Profile change detected
            onProfileChange?.();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rewards',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            // Reward change detected
            onProfileChange?.();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, onTasksChange, onProfileChange]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      // Back online - syncing data
      // Trigger sync when coming back online
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration: any) => {
          return registration.sync?.register('sync-tasks');
        });
      }
    };

    const handleOffline = () => {
      // Gone offline - using cached data
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}