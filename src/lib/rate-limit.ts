import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

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
// 20 requests per minute to protect Claude API credits
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
    limiter: Ratelimit.slidingWindow(1, '5 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/sync',
});
