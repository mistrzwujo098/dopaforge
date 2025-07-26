import { offlineStorage } from './offline-storage';
import * as queries from '@dopaforge/db';

// Wrapper functions that work offline

export async function getTodayTasksOffline(userId: string) {
  if (navigator.onLine) {
    try {
      const tasks = await queries.getTodayTasks(userId);
      // Cache for offline use
      await offlineStorage.saveTasks(tasks);
      return tasks;
    } catch (error) {
      console.error('Online fetch failed, falling back to cache:', error);
    }
  }

  // Offline or error - use cached data
  const allTasks = await offlineStorage.getTasks(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allTasks.filter(task => {
    const taskDate = new Date(task.created_at);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });
}

export async function createTaskOffline(task: any) {
  if (!navigator.onLine) {
    // Queue for later sync
    await offlineStorage.queueOfflineAction({
      action: 'create',
      data: task,
    });
    
    // Optimistically add to local cache
    const tempTask = {
      ...task,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    
    const tasks = await offlineStorage.getTasks(task.user_id);
    tasks.push(tempTask);
    await offlineStorage.saveTasks(tasks);
    
    return tempTask;
  }

  return queries.createTask(task);
}

export async function updateTaskOffline(id: string, updates: any) {
  if (!navigator.onLine) {
    // Queue for later sync
    await offlineStorage.queueOfflineAction({
      action: 'update',
      data: { id, updates },
    });
    
    // Optimistically update local cache
    const userId = updates.user_id || ''; // Need to track this
    const tasks = await offlineStorage.getTasks(userId);
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex >= 0) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      await offlineStorage.saveTasks(tasks);
    }
    
    return tasks[taskIndex];
  }

  return queries.updateTask(id, updates);
}

export async function getUserProfileOffline(userId: string) {
  if (navigator.onLine) {
    try {
      const profile = await queries.getUserProfile(userId);
      if (profile) {
        await offlineStorage.saveUserProfile(profile);
      }
      return profile;
    } catch (error) {
      console.error('Online fetch failed, falling back to cache:', error);
    }
  }

  return offlineStorage.getUserProfile(userId);
}

// Sync offline queue when back online
export async function syncOfflineQueue() {
  if (!navigator.onLine) return;

  const queue = await offlineStorage.getOfflineQueue();
  
  for (const item of queue) {
    try {
      switch (item.action) {
        case 'create':
          await queries.createTask(item.data);
          break;
        case 'update':
          await queries.updateTask(item.data.id, item.data.updates);
          break;
        case 'delete':
          await queries.deleteTask(item.data.id, item.data.userId);
          break;
      }
    } catch (error) {
      console.error('Failed to sync offline action:', error);
      // Keep in queue for retry
      continue;
    }
  }

  // Clear successfully synced items
  await offlineStorage.clearOfflineQueue();
}