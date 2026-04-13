import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return request.ip || 'unknown';
}

export function rateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  
  if (!store[ip] || store[ip].resetAt < now) {
    store[ip] = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: store[ip].resetAt,
    };
  }
  
  store[ip].count += 1;
  
  if (store[ip].count > MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: store[ip].resetAt,
    };
  }
  
  return {
    allowed: true,
    remaining: MAX_REQUESTS - store[ip].count,
    resetAt: store[ip].resetAt,
  };
}

export function rateLimitMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const limit = rateLimit(req);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': limit.resetAt.toString(),
            'Retry-After': Math.ceil((limit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    const response = await handler(req);
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', limit.resetAt.toString());
    
    return response;
  };
}

