import type { AuditItem } from "./google-seo-aeo-audit-utils";

export type AuditImpact = "high" | "medium";

/**
 * Plain-language framing for each check, written for an owner or manager rather
 * than an SEO specialist. Display-only: the audit's own label and detail stay
 * untouched because alert emails and exports read them.
 */
export type AuditGuidance = {
    title: string;
    why: string;
    impact: AuditImpact;
    effort: string;
};

const GUIDANCE: Record<string, AuditGuidance> = {
    "business-description": {
        title: "Business description",
        why: "Google and AI assistants read this to decide which searches you appear in.",
        impact: "high",
        effort: "About 10 min",
    },
    "review-frequency": {
        title: "New reviews this month",
        why: "A steady flow of fresh reviews is one of the strongest signals for ranking in local searches.",
        impact: "high",
        effort: "Ongoing",
    },
    "google-rating": {
        title: "Star rating",
        why: "Many customers skip businesses rated below 4 stars without reading further.",
        impact: "high",
        effort: "Ongoing",
    },
    "review-replies": {
        title: "Replies to reviews",
        why: "Replying shows customers you care, and Google favors owners who stay active.",
        impact: "high",
        effort: "A few min a day",
    },
    "profile-performance": {
        title: "Profile views",
        why: "Shows whether customers are actually finding and opening your Google listing.",
        impact: "medium",
        effort: "Check weekly",
    },
    images: {
        title: "Photos",
        why: "Listings with recent photos get more clicks, calls, and direction requests.",
        impact: "medium",
        effort: "About 5 min",
    },
    "post-frequency": {
        title: "Google posts",
        why: "Regular updates keep your profile looking open, active, and trustworthy.",
        impact: "medium",
        effort: "About 5 min a week",
    },
    "post-keywords": {
        title: "Keywords in your posts",
        why: "Mentioning what you offer helps you show up when people search for it.",
        impact: "medium",
        effort: "About 5 min",
    },
    "services-list": {
        title: "Services listed",
        why: "Customers and AI assistants match searches to the services on your profile.",
        impact: "medium",
        effort: "About 10 min",
    },
    "service-descriptions": {
        title: "Service descriptions",
        why: "A short line per service helps Google understand exactly what you do.",
        impact: "medium",
        effort: "About 10 min",
    },
    "service-area": {
        title: "Areas you serve",
        why: "Tells Google which towns you cover so you appear in searches there.",
        impact: "medium",
        effort: "About 5 min",
    },
};

export function getAuditGuidance(audit: AuditItem): AuditGuidance {
    return GUIDANCE[audit.id] ?? { title: audit.label, why: "", impact: "medium", effort: "" };
}

/** High-impact fixes first; ties keep the audit's original order. */
export function rankByImpact(audits: AuditItem[]): AuditItem[] {
    const weight = (audit: AuditItem) => (getAuditGuidance(audit).impact === "high" ? 0 : 1);
    return [...audits].sort((a, b) => weight(a) - weight(b));
}

export type ScoreVerdict = { label: string; tone: "success" | "warning" | "destructive" | "muted"; summary: string };

/** Turns a bare number into something an owner can act on without a legend. */
export function getScoreVerdict(score: number, measuredCount: number): ScoreVerdict {
    if (measuredCount === 0) {
        return { label: "Not scored yet", tone: "muted", summary: "We have not been able to read enough from Google yet." };
    }
    if (score >= 80) {
        return { label: "Strong", tone: "success", summary: "Your Google profile is in great shape. Keep it fresh." };
    }
    if (score >= 50) {
        return { label: "Fair", tone: "warning", summary: "Customers can find you, but you are leaving visits on the table." };
    }
    return { label: "Needs work", tone: "destructive", summary: "Competitors are likely showing up ahead of you. Start with the list below." };
}
