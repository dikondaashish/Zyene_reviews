import type { AuditItem } from "./google-seo-aeo-audit-utils";
import { calcKeywordCoverage } from "./google-seo-aeo-audit-utils";

export function buildGoogleSeoAeoAudits(input: {
    listingDescription: string;
    keywordCoverage: number;
    reviews30dCount: number;
    googleAvgLive: number;
    googleCountLive: number;
    replyRate: number;
    responded30dCount: number;
    perfTotals: { profileViews?: number; rawRowCount?: number } | null;
    actionLinkCount: number;
}): { audits: AuditItem[]; score: number; measuredCount: number } {
    const auditMinServicesTarget = 25;
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
        {
            id: "images",
            label: "# of Images",
            status: "pending",
            detail: "Not measured yet (Google media audit pending implementation).",
        },
        {
            id: "post-frequency",
            label: "Post Frequency",
            status: "pending",
            detail: "Not measured yet (Google posts audit pending implementation).",
        },
        {
            id: "post-keywords",
            label: "Post Keyword Optimization",
            status: "pending",
            detail: "Not measured yet (post keyword parsing pending implementation).",
        },
        {
            id: "services-list",
            label: "Action Links Coverage (proxy)",
            status: input.actionLinkCount >= auditMinServicesTarget ? "pass" : "fail",
            detail: `Detected ${input.actionLinkCount} place action links (proxy signal). Target: ${auditMinServicesTarget}+`,
        },
        {
            id: "service-descriptions",
            label: "Service Descriptions",
            status: "pending",
            detail: "Not measured yet (service description sync pending implementation).",
        },
        {
            id: "service-area",
            label: "Service Area",
            status: "pending",
            detail: "Not measured yet (service area distance audit pending implementation).",
        },
    ];

    const measured = audits.filter((a) => a.status !== "pending");
    const score =
        measured.length === 0
            ? 0
            : Math.round((measured.filter((a) => a.status === "pass").length / measured.length) * 100);

    return { audits, score, measuredCount: measured.length };
}
