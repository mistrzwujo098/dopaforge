import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface RedisLike {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
}

export class DistributedRateLimiter {
  private redis?: RedisLike;
  private fallbackLimits: Map<string, RateLimitInfo> = new Map();
  
  constructor(
    private config: RateLimitConfig,
    redis?: RedisLike
  ) {
    this.redis = redis;
  }

  private getKey(identifier: string, endpoint: string): string {
    return `rate_limit:${identifier}:${endpoint}`;
  }

  private cleanupExpired(): void {
    if (this.redis) return; // Redis handles expiration automatically
    
    const now = Date.now();
    for (const [key, info] of this.fallbackLimits.entries()) {
      if (now > info.resetTime) {
        this.fallbackLimits.delete(key);
      }
    }
  }

  async check(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.getKey(identifier, endpoint);
    const windowSeconds = Math.ceil(this.config.windowMs / 1000);
    
    // Try Redis first if available
    if (this.redis) {
      try {
        // Increment counter
        const count = await this.redis.incr(key);
        
        // Set expiration on first request
        if (count === 1) {
          await this.redis.expire(key, windowSeconds);
        }
        
        // Get remaining TTL
        const ttl = await this.redis.ttl(key);
        const resetTime = Date.now() + (ttl * 1000);
        
        if (count > this.config.maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetTime,
          };
        }
        
        return {
          allowed: true,
          remaining: Math.max(0, this.config.maxRequests - count),
          resetTime,
        };
      } catch (error) {
        console.error('Redis rate limiter error, falling back to in-memory:', error);
        // Fall through to in-memory implementation
      }
    }
    
    // Fallback to in-memory rate limiting
    this.cleanupExpired();
    
    const now = Date.now();
    const info = this.fallbackLimits.get(key);

    if (!info || now > info.resetTime) {
      // New window
      this.fallbackLimits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (info.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: info.resetTime,
      };
    }

    // Increment counter
    info.count++;
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - info.count,
      resetTime: info.resetTime,
    };
  }
}

// Redis client factory - returns undefined if Redis is not configured
export async function createRedisClient(): Promise<RedisLike | undefined> {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('REDIS_URL not configured, using in-memory rate limiting');
    return undefined;
  }
  
  try {
    // Use require with try-catch for truly optional dependency
    let Redis: any;
    try {
      Redis = require('ioredis');
    } catch (e) {
      console.log('ioredis not installed, using in-memory rate limiting');
      return undefined;
    }
    
    if (!Redis) {
      return undefined;
    }
    
    const redis = new Redis(redisUrl);
    
    // Test connection
    await redis.ping();
    console.log('Redis connected for distributed rate limiting');
    
    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return undefined;
  }
}

// Create rate limiters with Redis support if available
let redisClient: RedisLike | undefined;

export async function initializeRateLimiters() {
  redisClient = await createRedisClient();
  
  return {
    auth: new DistributedRateLimiter(
      { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
      redisClient
    ),
    api: new DistributedRateLimiter(
      { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
      redisClient
    ),
    tasks: new DistributedRateLimiter(
      { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
      redisClient
    ),
    ai: new DistributedRateLimiter(
      { windowMs: 60 * 1000, maxRequests: 20 }, // 20 AI requests per minute
      redisClient
    ),
  };
}

// Singleton instance
let rateLimitersInstance: Awaited<ReturnType<typeof initializeRateLimiters>> | null = null;

export async function getRateLimiters() {
  if (!rateLimitersInstance) {
    rateLimitersInstance = await initializeRateLimiters();
  }
  return rateLimitersInstance;
}

export function getRateLimitHeaders(result: { remaining: number; resetTime: number }, limit: number = 100) {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT or session
    // This is a simplified version - in production, decode the JWT
    return authHeader;
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  
  return ip;
}