import { createHmac, timingSafeEqual } from "node:crypto";

import { logger } from "@/lib/logger";

/**
 * Minimal Slack Web API client for the website chat's live takeover. Off unless
 * SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET and SLACK_SUPPORT_CHANNEL_ID are all set
 * (setup: docs/SUPPORT_CHAT_SLACK_SETUP.md).
 */
export function slackSupportConfig(): { token: string; channel: string; signingSecret: string } | null {
    const token = process.env.SLACK_BOT_TOKEN?.trim();
    const channel = process.env.SLACK_SUPPORT_CHANNEL_ID?.trim();
    const signingSecret = process.env.SLACK_SIGNING_SECRET?.trim();
    return token && channel && signingSecret ? { token, channel, signingSecret } : null;
}

async function slackApi<T>(method: string, body: Record<string, unknown>): Promise<T | null> {
    const config = slackSupportConfig();
    if (!config) return null;
    try {
        const res = await fetch(`https://slack.com/api/${method}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(5_000),
        });
        const data = (await res.json()) as T & { ok: boolean; error?: string };
        if (!data.ok) {
            logger.warn({ method, error: data.error }, "[support-chat] Slack API error");
            return null;
        }
        return data;
    } catch (err) {
        logger.warn({ err, method }, "[support-chat] Slack API request failed");
        return null;
    }
}

/** Posts to the support channel (optionally in a thread); returns the message ts. */
export async function postToSupportChannel(text: string, threadTs?: string): Promise<{ channel: string; ts: string } | null> {
    const config = slackSupportConfig();
    if (!config) return null;
    const data = await slackApi<{ channel: string; ts: string }>("chat.postMessage", {
        channel: config.channel,
        text,
        ...(threadTs ? { thread_ts: threadTs } : {}),
        unfurl_links: false,
        unfurl_media: false,
    });
    return data ? { channel: data.channel, ts: data.ts } : null;
}

const nameCache = new Map<string, string>();

/** First name shown to the visitor ("Jane from the team"); never the full Slack profile. */
export async function slackUserFirstName(userId: string): Promise<string> {
    const cached = nameCache.get(userId);
    if (cached) return cached;
    const data = await slackApi<{ user?: { profile?: { first_name?: string; display_name?: string; real_name?: string } } }>(
        "users.info",
        { user: userId },
    );
    const profile = data?.user?.profile;
    const raw = profile?.first_name || profile?.display_name || profile?.real_name || "The team";
    const name = raw.split(/\s+/)[0].replace(/[^\p{L}\p{N}'-]/gu, "").slice(0, 30) || "The team";
    nameCache.set(userId, name);
    return name;
}

/** Slack request signing (v0). Rejects anything older than five minutes to stop replays. */
export function verifySlackSignature(rawBody: string, timestamp: string | null, signature: string | null): boolean {
    const config = slackSupportConfig();
    if (!config || !timestamp || !signature) return false;
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > 300) return false;
    const expected = `v0=${createHmac("sha256", config.signingSecret).update(`v0:${timestamp}:${rawBody}`).digest("hex")}`;
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
}
