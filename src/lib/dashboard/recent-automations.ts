/**
 * "What did Zyene just do for me?" One list, newest first, merged from the work automations
 * actually finished: replies posted to Google and review requests that went out.
 */
export type RecentAutomationKind = "auto-reply" | "approved-reply" | "request" | "reminder";

export type RecentAutomation = { id: string; kind: RecentAutomationKind; title: string; detail: string; at: string; href: string };

export type RecentAutomationsInput = {
    autoReplies: Array<{ id: string; author_name: string | null; rating: number | null; responded_at: string | null }>;
    approvedReplies: Array<{ id: string; posted_at: string | null; reviews: { author_name: string | null; rating: number | null } | null }>;
    messages: Array<{ id: string; step: number; channel: string; status: string; created_at: string; customer_name: string | null }>;
};

/** Messages that reached, or were handed to, the provider. Failures belong in the activity log, not here. */
const DONE_MESSAGE_STATUSES = new Set(["sent", "delivered"]);

const firstName = (name: string | null) => (name || "").trim().split(/\s+/)[0] || null;
const stars = (rating: number | null) => (rating ? `${rating}★ ` : "");
const reviewer = (name: string | null) => (firstName(name) ? `${firstName(name)}'s` : "a");

export function buildRecentAutomations(input: RecentAutomationsInput, limit = 6): RecentAutomation[] {
    const items: RecentAutomation[] = [];
    for (const r of input.autoReplies) {
        if (!r.responded_at) continue;
        items.push({
            id: `auto-${r.id}`, kind: "auto-reply", at: r.responded_at, href: "/reviews?status=responded",
            title: `Replied to ${reviewer(r.author_name)} ${stars(r.rating)}review`,
            detail: "Posted to Google automatically",
        });
    }
    for (const d of input.approvedReplies) {
        if (!d.posted_at) continue;
        items.push({
            id: `draft-${d.id}`, kind: "approved-reply", at: d.posted_at, href: "/reviews?status=responded",
            title: `Replied to ${reviewer(d.reviews?.author_name ?? null)} ${stars(d.reviews?.rating ?? null)}review`,
            detail: "Drafted for you, posted after approval",
        });
    }
    for (const m of input.messages) {
        if (!DONE_MESSAGE_STATUSES.has(m.status)) continue;
        const who = firstName(m.customer_name) ?? "a customer";
        const channel = m.channel === "sms" ? "text" : "email";
        const isReminder = m.step > 1;
        items.push({
            id: `msg-${m.id}`, kind: isReminder ? "reminder" : "request", at: m.created_at, href: "/requests",
            title: isReminder ? `Sent a reminder to ${who}` : `Asked ${who} for a review`,
            detail: `By ${channel}${m.status === "delivered" ? " · delivered" : ""}`,
        });
    }
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
