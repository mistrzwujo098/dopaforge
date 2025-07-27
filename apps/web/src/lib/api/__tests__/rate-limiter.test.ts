import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 10 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within limit', () => {
    const identifier = 'test-user';
    const endpoint = 'test-endpoint';

    for (let i = 0; i < 10; i++) {
      const result = rateLimiter.check(identifier, endpoint);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9 - i);
    }
  });

  it('should block requests exceeding limit', () => {
    const identifier = 'test-user';
    const endpoint = 'test-endpoint';

    // Use up all requests
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(identifier, endpoint);
    }

    // Next request should be blocked
    const result = rateLimiter.check(identifier, endpoint);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after window expires', () => {
    const identifier = 'test-user';
    const endpoint = 'test-endpoint';

    // Use up all requests
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(identifier, endpoint);
    }

    // Advance time past the window
    vi.advanceTimersByTime(61000);

    // Should be allowed again
    const result = rateLimiter.check(identifier, endpoint);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should track different identifiers separately', () => {
    const endpoint = 'test-endpoint';

    // Use up requests for user1
    for (let i = 0; i < 10; i++) {
      rateLimiter.check('user1', endpoint);
    }

    // user2 should still be allowed
    const result = rateLimiter.check('user2', endpoint);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should track different endpoints separately', () => {
    const identifier = 'test-user';

    // Use up requests for endpoint1
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(identifier, 'endpoint1');
    }

    // endpoint2 should still be allowed
    const result = rateLimiter.check(identifier, 'endpoint2');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should provide correct reset time', () => {
    const identifier = 'test-user';
    const endpoint = 'test-endpoint';
    const startTime = Date.now();

    const result = rateLimiter.check(identifier, endpoint);
    expect(result.resetTime).toBe(startTime + 60000);
  });

  it('should cleanup expired entries', () => {
    // Create multiple entries
    for (let i = 0; i < 5; i++) {
      rateLimiter.check(`user${i}`, 'endpoint');
    }

    // Advance time past the window
    vi.advanceTimersByTime(61000);

    // Trigger cleanup by checking a new request
    rateLimiter.check('new-user', 'endpoint');

    // Old entries should be cleaned up (we can't directly test this without exposing internals,
    // but we can verify that old identifiers work as new)
    for (let i = 0; i < 5; i++) {
      const result = rateLimiter.check(`user${i}`, 'endpoint');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    }
  });
});