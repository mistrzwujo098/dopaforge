import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToast';

interface OfflineAction {
  id: string;
  type: 'create_task' | 'update_task' | 'complete_task';
  data: any;
  timestamp: number;
}

export function useOfflineSync(userId: string) {
  const { toast } = useToast();
  const syncInProgress = useRef(false);

  // Store action in offline queue
  const queueOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const offlineQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    const newAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    offlineQueue.push(newAction);
    localStorage.setItem('offline_queue', JSON.stringify(offlineQueue));
  };

  // Sync offline actions when back online
  const syncOfflineActions = async () => {
    if (syncInProgress.current || !navigator.onLine) return;
    
    syncInProgress.current = true;
    const offlineQueue: OfflineAction[] = JSON.parse(
      localStorage.getItem('offline_queue') || '[]'
    );
    
    if (offlineQueue.length === 0) {
      syncInProgress.current = false;
      return;
    }

    const failedActions: OfflineAction[] = [];
    
    for (const action of offlineQueue) {
      try {
        // Process each action based on type
        switch (action.type) {
          case 'create_task':
            const response = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...action.data, user_id: userId }),
            });
            if (!response.ok) throw new Error('Failed to create task');
            break;
            
          case 'update_task':
            await fetch(`/api/tasks/${action.data.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data),
            });
            break;
            
          case 'complete_task':
            await fetch(`/api/tasks/${action.data.id}/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId }),
            });
            break;
        }
      } catch (error) {
        console.error('Failed to sync offline action:', error);
        failedActions.push(action);
      }
    }
    
    // Update queue with failed actions only
    localStorage.setItem('offline_queue', JSON.stringify(failedActions));
    
    if (failedActions.length === 0) {
      toast({
        title: 'Synchronizacja zakończona',
        description: `${offlineQueue.length} zmian zostało zsynchronizowanych`,
      });
    } else {
      toast({
        title: 'Częściowa synchronizacja',
        description: `${offlineQueue.length - failedActions.length} z ${offlineQueue.length} zmian zsynchronizowano`,
        variant: 'destructive',
      });
    }
    
    syncInProgress.current = false;
  };

  useEffect(() => {
    // Sync when coming back online
    const handleOnline = () => {
      setTimeout(syncOfflineActions, 2000); // Wait a bit for connection to stabilize
    };
    
    window.addEventListener('online', handleOnline);
    
    // Try to sync on mount if online
    if (navigator.onLine) {
      syncOfflineActions();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [userId]);

  return {
    queueOfflineAction,
    syncOfflineActions,
  };
}