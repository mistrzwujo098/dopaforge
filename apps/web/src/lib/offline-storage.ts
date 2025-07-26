// Offline storage using IndexedDB for better performance and capacity

const DB_NAME = 'dopaforge-offline';
const DB_VERSION = 1;

interface OfflineTask {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores for offline data
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('offline_queue')) {
          db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('user_profile')) {
          db.createObjectStore('user_profile', { keyPath: 'user_id' });
        }
      };
    });
  }

  async saveTasks(tasks: any[]) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');

    for (const task of tasks) {
      store.put(task);
    }

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getTasks(userId: string): Promise<any[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['tasks'], 'readonly');
    const store = transaction.objectStore('tasks');
    const index = store.index('user_id');
    const request = index.getAll(userId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async queueOfflineAction(action: Omit<OfflineTask, 'id' | 'timestamp'>) {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    
    store.add({
      ...action,
      timestamp: Date.now(),
    });

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getOfflineQueue(): Promise<OfflineTask[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['offline_queue'], 'readonly');
    const store = transaction.objectStore('offline_queue');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearOfflineQueue() {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    store.clear();

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async saveUserProfile(profile: any) {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['user_profile'], 'readwrite');
    const store = transaction.objectStore('user_profile');
    store.put(profile);

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getUserProfile(userId: string): Promise<any | null> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['user_profile'], 'readonly');
    const store = transaction.objectStore('user_profile');
    const request = store.get(userId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();