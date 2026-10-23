import type { BusinessDestination, BusinessDirectoryEntry } from "@/types/business-directory";

export type BusinessAttention = {
    tone: "danger" | "warning" | "ok";
    message: string;
    action: { label: string; destination: BusinessDestination } | null;
};

/** The single most useful thing an owner can do for this location right now. */
export function getBusinessAttention(business: BusinessDirectoryEntry): BusinessAttention {
    if (business.googleStatus === "needs_reconnect") {
        return {
            tone: "danger",
            message: "Google disconnected. New reviews have stopped syncing.",
            action: { label: "Reconnect Google", destination: "/settings/integrations" },
        };
    }
    if (business.googleStatus === "not_connected") {
        return {
            tone: "warning",
            message: "Connect Google to bring in reviews and reply from here.",
            action: { label: "Connect Google", destination: "/settings/integrations" },
        };
    }
    if (business.pendingReviews > 0) {
        const n = business.pendingReviews;
        return {
            tone: "warning",
            message: `${n.toLocaleString("en-US")} review${n === 1 ? " is" : "s are"} waiting for a reply.`,
            action: { label: "Reply now", destination: "/reviews" },
        };
    }
    return { tone: "ok", message: "All caught up. Nothing needs you here.", action: null };
}

const TONE_RANK: Record<BusinessAttention["tone"], number> = { danger: 0, warning: 1, ok: 2 };

/** Sort key: broken connections first, then anything waiting, then locations that are fine. */
export function attentionRank(business: BusinessDirectoryEntry): number {
    return TONE_RANK[getBusinessAttention(business).tone];
}

export function needsAttention(business: BusinessDirectoryEntry): boolean {
    return getBusinessAttention(business).tone !== "ok";
}

export type BusinessesSummary = {
    locations: number;
    averageRating: number | null;
    totalReviews: number;
    waitingForReply: number;
    googleConnected: number;
    needingAttention: number;
};

/** Rolls every location up into the numbers an owner asks about first. Rating is weighted by review count. */
export function summarizeBusinesses(businesses: BusinessDirectoryEntry[]): BusinessesSummary {
    let ratingWeight = 0;
    let ratingSum = 0;
    for (const business of businesses) {
        if (business.rating !== null && business.reviewCount > 0) {
            ratingSum += business.rating * business.reviewCount;
            ratingWeight += business.reviewCount;
        }
    }
    return {
        locations: businesses.length,
        averageRating: ratingWeight > 0 ? ratingSum / ratingWeight : null,
        totalReviews: businesses.reduce((sum, b) => sum + b.reviewCount, 0),
        waitingForReply: businesses.reduce((sum, b) => sum + b.pendingReviews, 0),
        googleConnected: businesses.filter((b) => b.googleStatus === "connected").length,
        needingAttention: businesses.filter(needsAttention).length,
    };
}
