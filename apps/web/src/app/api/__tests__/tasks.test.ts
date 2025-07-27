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
        est_minutes: 25,
        status: 'pending',
        display_order: 0,
      };

      const { data, error } = await supabase
        .from('micro_tasks')
        .insert(newTask)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.title).toBe(newTask.title);
      expect(data.est_minutes).toBe(newTask.est_minutes);
      expect(data.status).toBe('pending');
    });

    it('should retrieve user tasks', async () => {
      // Create multiple tasks
      const tasks = [
        {
          user_id: testUserId,
          title: 'Task 1',
          est_minutes: 15,
          status: 'pending',
          display_order: 0,
        },
        {
          user_id: testUserId,
          title: 'Task 2',
          est_minutes: 45,
          status: 'pending',
          display_order: 1,
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
      // Verify we get both tasks - order might vary by created_at
      const titles = data.map((task: any) => task.title);
      expect(titles).toContain('Task 1');
      expect(titles).toContain('Task 2');
    });

    it('should update a task', async () => {
      // Create a task
      const { data: createdTask } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'Original Title',
          est_minutes: 25,
          status: 'pending',
          display_order: 0,
        })
        .select()
        .single();

      // Update the task
      const { data: updatedTask, error } = await supabase
        .from('micro_tasks')
        .update({
          title: 'Updated Title',
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', createdTask.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.status).toBe('completed');
      expect(updatedTask.completed_at).toBeDefined();
    });

    it('should delete a task', async () => {
      // Create a task
      const { data: createdTask } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'Task to Delete',
          est_minutes: 25,
          status: 'pending',
          display_order: 0,
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
    it('should mark task as completed and update completion time', async () => {
      // Create a task
      const { data: task } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'Completion Test Task',
          est_minutes: 25,
          status: 'pending',
          display_order: 0,
        })
        .select()
        .single();

      // Complete the task
      const { data: completedTask } = await supabase
        .from('micro_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id)
        .select()
        .single();

      expect(completedTask.status).toBe('completed');
      expect(completedTask.completed_at).toBeDefined();
    });

    it('should track task start time', async () => {
      // Create a task
      const { data: task } = await supabase
        .from('micro_tasks')
        .insert({
          user_id: testUserId,
          title: 'Timer Test Task',
          est_minutes: 30,
          status: 'pending',
          display_order: 0,
        })
        .select()
        .single();

      // Start the task
      const startTime = new Date().toISOString();
      const { data: startedTask, error } = await supabase
        .from('micro_tasks')
        .update({
          started_at: startTime,
        })
        .eq('id', task.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(startedTask.started_at).toBeDefined();
    });
  });

  describe('Task Filtering and Sorting', () => {
    beforeEach(async () => {
      // Create test tasks with different statuses
      const tasks = [
        {
          user_id: testUserId,
          title: 'Completed Task',
          est_minutes: 15,
          status: 'completed',
          completed_at: new Date().toISOString(),
          display_order: 0,
        },
        {
          user_id: testUserId,
          title: 'Pending Task 1',
          est_minutes: 30,
          status: 'pending',
          display_order: 1,
        },
        {
          user_id: testUserId,
          title: 'Pending Task 2',
          est_minutes: 45,
          status: 'pending',
          display_order: 2,
        },
      ];

      await supabase.from('micro_tasks').insert(tasks);
    });

    it('should filter incomplete tasks', async () => {
      const { data, error } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'pending');

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data.every((task: any) => task.status === 'pending')).toBe(true);
    });

    it('should sort by display order', async () => {
      const { data, error } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', testUserId)
        .order('display_order', { ascending: true });

      expect(error).toBeNull();
      expect(data[0].display_order).toBe(0);
      expect(data[1].display_order).toBe(1);
      expect(data[2].display_order).toBe(2);
    });

    it('should filter by estimated duration', async () => {
      const { data, error } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', testUserId)
        .gte('est_minutes', 30)
        .lte('est_minutes', 45);

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].title).toContain('Pending Task');
    });
  });
});