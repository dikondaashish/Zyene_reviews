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

// 6. Public, unauthenticated form submissions (contact, demo request, waitlist,
// private feedback). These reach real inboxes and burn Resend quota, and there
// is no account behind them to attribute abuse to.
//
// globalApiRateLimit already covers /api/*, but 150/min is a DDoS ceiling, not a
// sane budget for a form a human fills in — that allowance is for an authenticated
// dashboard firing many parallel fetches. 5 per 10 minutes per IP is generous for
// a person and useless for a flooder.
export const publicFormRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/public-form',
});

/**
 * Best-effort client IP for rate-limit keying, behind Vercel's proxy.
 *
 * `x-forwarded-for` is caller-spoofable in general; on Vercel the platform
 * rewrites it, so the leftmost entry is the real client. Falls back to a shared
 * "anonymous" bucket rather than failing open per-request — a request with no
 * usable IP still gets counted, just alongside every other such request.
 */
export function clientIpFrom(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "anonymous"
    );
}
