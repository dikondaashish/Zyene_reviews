import { buildGbpAuditChecks } from "@/services/aeo/technical-audit/gbp-audit-checks";
import type { GbpAuditSignals } from "@/services/aeo/technical-audit/gbp-audit-signals";
import { isScoredAudit, type AuditItem } from "./google-seo-aeo-audit-utils";

export function buildGoogleSeoAeoAudits(input: {
    listingDescription: string;
    keywordCoverage: number;
    reviews30dCount: number;
    googleAvgLive: number;
    googleCountLive: number;
    replyRate: number;
    responded30dCount: number;
    perfTotals: { profileViews?: number; rawRowCount?: number } | null;
    /** Real Google Business Profile data behind the six GBP checks (F5.10). */
    gbpSignals: GbpAuditSignals;
    /** Tracked search keywords, used to score post keyword coverage. */
    topKeywords: string[];
    now?: Date;
}): { audits: AuditItem[]; score: number; measuredCount: number } {
    const audits: AuditItem[] = [
        {
            id: "business-description",
            label: "Business Description",
            status:
                input.listingDescription.length >= 80 && input.keywordCoverage >= 3 ? "pass" : "fail",
            detail:
                input.listingDescription.length === 0
                    ? "No Google description found."
                    : `${input.keywordCoverage} target keywords found in description.`,
        },
        {
            id: "review-frequency",
            label: "Review Frequency (30d)",
            status: input.reviews30dCount >= 10 ? "pass" : "fail",
            detail: `${input.reviews30dCount} Google reviews in last 30 days.`,
        },
        {
            id: "google-rating",
            label: "Google Rating",
            status: input.googleAvgLive >= 4.2 ? "pass" : "fail",
            detail: `${input.googleAvgLive.toFixed(1)} / 5 (${input.googleCountLive.toLocaleString()} visible in Zyene)`,
        },
        {
            id: "review-replies",
            label: "Review Replies (30d)",
            status: input.replyRate >= 0.8 ? "pass" : "fail",
            detail: `${Math.round(input.replyRate * 100)}% replied (${input.responded30dCount}/${input.reviews30dCount})`,
        },
        {
            id: "profile-performance",
            label: "Profile Activity (30d)",
            status:
                (input.perfTotals?.profileViews || 0) > 0 && (input.perfTotals?.rawRowCount || 0) > 0
                    ? "pass"
                    : "fail",
            detail: `${input.perfTotals?.profileViews?.toLocaleString() || 0} profile views`,
        },
        ...buildGbpAuditChecks(input.gbpSignals, { keywords: input.topKeywords, now: input.now }),
    ];

    const scored = audits.filter(isScoredAudit);
    const score =
        scored.length === 0
            ? 0
            : Math.round((scored.filter((a) => a.status === "pass").length / scored.length) * 100);

    return { audits, score, measuredCount: scored.length };
}
