import { Ratelimit } from '@upstash/ratelimit';
import { redis } from "@/lib/db/redis";

// 1. Review Requests Rate Limit (Single sends like SMS/Email)
// 10 requests per minute per user/business
export const requestRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/request',
});

// 2. Campaign Sends Rate Limit (Bulk sends)
// 5 campaign trigger requests per minute
export const campaignRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/campaign',
});

// 3. AI Reply Generation Rate Limit
// 20 requests per minute to protect Vertex / Gemini usage
export const aiRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/ai',
});

// 4. Sync Operations Rate Limit (Google/Yelp/Facebook sync)
// 1 manual sync allowed per 5 minutes per business to prevent API spam
export const syncRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(2, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/sync',
});

// 5. Global API Rate Limit (DDoS protection layer in proxy.ts)
// Per-IP cap across /api/* (minus whitelist). 60/min was too tight for dashboard SPA bursts
// after login (many parallel fetches). Endpoint-specific limits still apply separately.
export const globalApiRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(150, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/global',
});
