import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../client';

// Mock Supabase client
vi.mock('../../supabase-browser', () => ({
  createSupabaseBrowser: () => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  }),
}));

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return tasks for a user', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', user_id: 'user1' },
        { id: '2', title: 'Task 2', user_id: 'user1' },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
      };

      vi.mocked(apiClient['supabase']).from.mockReturnValue(mockSupabase as any);

      const result = await apiClient.getTasks('user1');

      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' };

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(apiClient['supabase']).from.mockReturnValue(mockSupabase as any);

      const result = await apiClient.getTasks('user1');

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        message: 'Database error',
        code: 'DB_ERROR',
        status: 500,
      });
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask = {
        user_id: 'user1',
        title: 'New Task',
        est_minutes: 30,
        status: 'pending' as const,
      };

      const createdTask = { id: '123', ...newTask };

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdTask, error: null }),
      };

      vi.mocked(apiClient['supabase']).from.mockReturnValue(mockSupabase as any);

      const result = await apiClient.createTask(newTask);

      expect(result.data).toEqual(createdTask);
      expect(result.error).toBeUndefined();
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const taskId = '123';
      const update = { title: 'Updated Task', status: 'completed' as const };
      const updatedTask = { id: taskId, ...update };

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedTask, error: null }),
      };

      vi.mocked(apiClient['supabase']).from.mockReturnValue(mockSupabase as any);

      const result = await apiClient.updateTask(taskId, update);

      expect(result.data).toEqual(updatedTask);
      expect(result.error).toBeUndefined();
    });
  });

  describe('spinLootbox', () => {
    it('should return a random reward', async () => {
      const result = await apiClient.spinLootbox('user1');

      expect(result.data).toBeDefined();
      expect(result.data?.type).toMatch(/^(xp|badge|powerup)$/);
      expect(result.data?.payload).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle unknown errors', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue('Unknown error'),
      };

      vi.mocked(apiClient['supabase']).from.mockReturnValue(mockSupabase as any);

      const result = await apiClient.getUserProfile('user1');

      expect(result.error).toEqual({
        message: 'Wystąpił nieoczekiwany błąd',
        code: 'UNKNOWN_ERROR',
        status: 500,
      });
    });
  });
});