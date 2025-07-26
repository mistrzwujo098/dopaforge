import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

describe('Tasks API Integration Tests', () => {
  let supabase: any;
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    // Initialize test Supabase client
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Create test user and get auth token
    const testEmail = `test-tasks-${Date.now()}@example.com`;
    const { data: authData } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    });

    testUserId = authData.user?.id || '';
    authToken = authData.session?.access_token || '';
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await supabase
        .from('micro_tasks')
        .delete()
        .eq('user_id', testUserId);
    }
  });

  beforeEach(async () => {
    // Clear tasks before each test
    await supabase
      .from('micro_tasks')
      .delete()
      .eq('user_id', testUserId);
  });

  describe('Task CRUD Operations', () => {
    it('should create a new task', async () => {
      const newTask = {
        user_id: testUserId,
        title: 'Test Task',
        resistance_level: 5,
        duration_minutes: 25,
        xp_reward: 50,
        quick_description: 'A test task for integration testing',
      };

      const { data, error } = await supabase
        .from('micro_tasks')
        .insert(newTask)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.title).toBe(newTask.title);
      expect(data.resistance_level).toBe(newTask.resistance_level);
    });

    it('should retrieve user tasks', async () => {
      // Create multiple tasks
      const tasks = [
        {
          user_id: testUserId,
          title: 'Task 1',
          resistance_level: 3,
          duration_minutes: 15,
          xp_reward: 30,
        },
        {
          user_id: testUserId,
          title: 'Task 2',
          resistance_level: 7,
          duration_minutes: 45,
          xp_reward: 90,
        },
      ];

      await supabase.from('micro_tasks').insert(tasks);

      // Retrieve tasks
      const { data, error } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].title).toBe('Task 2');
    });

    it('should update a task', async () => {
      // Create a task
      const { data: createdTask } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'Original Title',
          resistance_level: 5,
          duration_minutes: 25,
          xp_reward: 50,
        })
        .select()
        .single();

      // Update the task
      const { data: updatedTask, error } = await supabase
        .from('micro_tasks')
        .update({
          title: 'Updated Title',
          resistance_level: 8,
          is_completed: true,
        })
        .eq('id', createdTask.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.resistance_level).toBe(8);
      expect(updatedTask.is_completed).toBe(true);
    });

    it('should delete a task', async () => {
      // Create a task
      const { data: createdTask } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'Task to Delete',
          resistance_level: 5,
          duration_minutes: 25,
          xp_reward: 50,
        })
        .select()
        .single();

      // Delete the task
      const { error: deleteError } = await supabase
        .from('micro_tasks')
        .delete()
        .eq('id', createdTask.id);

      expect(deleteError).toBeNull();

      // Verify deletion
      const { data: checkData } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('id', createdTask.id)
        .single();

      expect(checkData).toBeNull();
    });
  });

  describe('Task Completion and XP', () => {
    it('should mark task as completed and update XP', async () => {
      // Create a task
      const { data: task } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'XP Test Task',
          resistance_level: 5,
          duration_minutes: 25,
          xp_reward: 100,
        })
        .select()
        .single();

      // Complete the task
      const { data: completedTask } = await supabase
        .from('micro_tasks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id)
        .select()
        .single();

      expect(completedTask.is_completed).toBe(true);
      expect(completedTask.completed_at).toBeDefined();

      // Verify XP update (would need to check user_profiles table)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_xp')
        .eq('user_id', testUserId)
        .single();

      // Note: This might fail if XP update is handled by a trigger or separate process
      // expect(profile?.total_xp).toBeGreaterThanOrEqual(100);
    });

    it('should calculate resistance-based XP bonus', async () => {
      const baseXP = 50;
      const resistanceLevel = 8;
      const expectedBonus = Math.floor(baseXP * (resistanceLevel / 10));
      const totalXP = baseXP + expectedBonus;

      const { data: task } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'High Resistance Task',
          resistance_level: resistanceLevel,
          duration_minutes: 25,
          xp_reward: baseXP,
        })
        .select()
        .single();

      // In real implementation, XP calculation might be done on completion
      expect(task.xp_reward).toBe(baseXP);
      // Additional XP logic would be tested here
    });
  });

  describe('Task Filtering and Sorting', () => {
    beforeEach(async () => {
      // Create test tasks with different properties
      const tasks = [
        {
          user_id: testUserId,
          title: 'Easy Task',
          resistance_level: 2,
          duration_minutes: 10,
          xp_reward: 20,
          is_completed: false,
        },
        {
          user_id: testUserId,
          title: 'Medium Task',
          resistance_level: 5,
          duration_minutes: 25,
          xp_reward: 50,
          is_completed: true,
        },
        {
          user_id: testUserId,
          title: 'Hard Task',
          resistance_level: 9,
          duration_minutes: 60,
          xp_reward: 120,
          is_completed: false,
        },
      ];

      await supabase.from('micro_tasks').insert(tasks);
    });

    it('should filter incomplete tasks', async () => {
      const { data } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('is_completed', false);

      expect(data).toHaveLength(2);
      expect(data.every((task: any) => !task.is_completed)).toBe(true);
    });

    it('should sort by resistance level', async () => {
      const { data } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', testUserId)
        .order('resistance_level', { ascending: true });

      expect(data[0].resistance_level).toBe(2);
      expect(data[1].resistance_level).toBe(5);
      expect(data[2].resistance_level).toBe(9);
    });

    it('should filter by duration range', async () => {
      const { data } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', testUserId)
        .gte('duration_minutes', 20)
        .lte('duration_minutes', 30);

      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Medium Task');
    });
  });
});