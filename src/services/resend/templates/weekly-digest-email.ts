import { emailButton, emailLayout, emailParagraph, emailSettingsFooter } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

interface ReviewDigestItem {
    rating: number;
    authorName: string;
    text: string;
    sentiment?: "positive" | "negative" | "neutral";
}
interface WeeklyDigestProps {
    businessName: string; reviews: ReviewDigestItem[]; totalNew: number;
    avgRating: number; pendingCount: number; dashboardUrl: string; settingsUrl: string;
}

export function weeklyDigestEmail({ businessName, reviews, totalNew, avgRating, pendingCount, dashboardUrl, settingsUrl }: WeeklyDigestProps): string {
    const reviewRows = reviews.map(review => {
        const rating = Math.max(0, Math.min(5, Math.round(review.rating) || 0));
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        const snippet = review.text.length > 100 ? `${review.text.slice(0, 100)}…` : review.text;
        return `<div style="border-bottom:1px solid #e4e4e7;padding:16px 0;">
<p style="margin:0 0 4px;font-weight:700;">${escapeHtml(review.authorName)}</p>
<p style="margin:0 0 8px;font-size:14px;">${stars} · ${rating} out of 5</p>
<p style="margin:0;font-size:14px;">${escapeHtml(snippet || "Rating only; no written review.")}</p></div>`;
    }).join("");
    const stats = [[String(totalNew), "New reviews"], [totalNew > 0 ? avgRating.toFixed(1) : "—", "Average rating"], [String(pendingCount), "Awaiting reply"]];
    return emailLayout({
        title: "Your weekly review summary",
        preheader: `${businessName}: ${totalNew} new reviews and ${pendingCount} awaiting a reply.`,
        eyebrow: "Past 7 days",
        bodyHtml: emailParagraph(`Here's the latest feedback for ${businessName}.`)
            + `<table class="email-panel" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;background-color:#f5f5f4;border:1px solid #e4e4e7;margin:24px 0;"><tr>${stats.map(([value, label]) =>
                `<td class="email-stat" width="33%" align="center" style="padding:16px 6px;"><p class="email-stat-number" style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">${value}</p><p class="email-muted" style="margin:0;font-size:12px;line-height:1.4;color:#52525b;">${label}</p></td>`).join("")}</tr></table>`
            + `<h2 style="margin:24px 0 8px;font-size:18px;color:#18181b;">Recent reviews</h2>`
            + (reviews.length ? reviewRows : emailParagraph("No new reviews this week. You can still follow up on reviews awaiting a reply in your dashboard."))
            + emailButton("Open your review inbox", dashboardUrl),
        footerHtml: emailSettingsFooter(settingsUrl),
    });
}
