import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    DATABASE_URL: 'postgresql://postgres:test123@localhost:54322/dopaforge_test',
  },
}));

describe('Auth API Integration Tests', () => {
  let supabase: any;

  beforeAll(() => {
    // Initialize test Supabase client
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  });

  afterAll(async () => {
    // Cleanup test data
    if (supabase) {
      await supabase.auth.signOut();
    }
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid email', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testEmail);
    });

    it('should reject invalid email format', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: 'invalid-email',
        password: 'TestPassword123!',
      });

      expect(error).toBeDefined();
      expect(data.user).toBeNull();
    });

    it('should reject weak passwords', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: '123',
      });

      expect(error).toBeDefined();
      expect(error?.message.toLowerCase()).toContain('password');
    });
  });

  describe('POST /api/auth/signin', () => {
    const testEmail = 'existing-user@example.com';
    const testPassword = 'TestPassword123!';

    beforeAll(async () => {
      // Create a test user
      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
    });

    it('should sign in with valid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.user?.email).toBe(testEmail);
    });

    it('should reject invalid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'WrongPassword',
      });

      expect(error).toBeDefined();
      expect(data.session).toBeNull();
    });

    it('should handle magic link requests', async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email: testEmail,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      expect(error).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should maintain session after signin', async () => {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'existing-user@example.com',
        password: 'TestPassword123!',
      });

      const { data: sessionData } = await supabase.auth.getSession();

      expect(sessionData.session).toBeDefined();
      expect(sessionData.session?.user.email).toBe('existing-user@example.com');
    });

    it('should clear session after signout', async () => {
      await supabase.auth.signOut();
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      expect(sessionData.session).toBeNull();
    });
  });
});