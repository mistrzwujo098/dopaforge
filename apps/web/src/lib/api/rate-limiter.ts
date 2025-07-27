import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitInfo> = new Map();
  
  constructor(private config: RateLimitConfig) {}

  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, info] of this.limits.entries()) {
      if (now > info.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  check(identifier: string, endpoint: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanupExpired();
    
    const key = this.getKey(identifier, endpoint);
    const now = Date.now();
    const info = this.limits.get(key);

    if (!info || now > info.resetTime) {
      // New window
      this.limits.set(key, {
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

// Rate limit configurations for different endpoints
export const rateLimiters = {
  auth: new RateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }), // 5 requests per 15 minutes
  api: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 100 }), // 100 requests per minute
  tasks: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 60 }), // 60 requests per minute
};

export function getRateLimitHeaders(result: { remaining: number; resetTime: number }) {
  return {
    'X-RateLimit-Limit': '100',
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