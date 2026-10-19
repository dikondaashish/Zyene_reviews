import { Ratelimit } from "@/lib/auth/fail-closed-rate-limit";
import { redis } from "@/lib/db/redis";

/**
 * The website chat is anonymous and every message costs a model call, so it gets
 * its own budgets: a burst cap and a daily cap per IP, plus a per-conversation cap
 * so one tab cannot be used as a free general-purpose chatbot.
 */
export const supportChatBurstRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(12, "5 m"),
    prefix: "@upstash/ratelimit/support-chat-burst",
});

export const supportChatDailyRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 d"),
    prefix: "@upstash/ratelimit/support-chat-daily",
});

export const supportChatSessionRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(25, "1 d"),
    prefix: "@upstash/ratelimit/support-chat-session",
});

/** Lead emails go to a real inbox; a person submits this once, maybe twice. */
export const supportChatLeadRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "@upstash/ratelimit/support-chat-lead",
});

/** Reputation checks cost two Places API calls each. */
export const supportChatToolRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(4, "10 m"),
    prefix: "@upstash/ratelimit/support-chat-tool",
});

/** Cheap reads (demo slots, feedback, agent message catch-up). */
export const supportChatReadRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(40, "10 m"),
    prefix: "@upstash/ratelimit/support-chat-read",
});
