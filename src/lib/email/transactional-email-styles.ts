/**
 * Inline hex colors for transactional / marketing emails.
 * Email clients require explicit values - keep them centralized here.
 */
import { escapeHtml } from "@/lib/security/html-escape";
import { getAuthSiteUrl } from "@/lib/routing/platform-routes";

const AUTH_SIGNUP_URL = getAuthSiteUrl(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com",
    "/signup"
);

export const EMAIL_COLORS = {
    body: "#52525b",
    muted: "#71717a",
    subtle: "#a1a1aa",
    heading: "#18181b",
    border: "#e4e4e7",
    link: "#16a34a",
} as const;

export function emailMutedFooter(text: string): string {
    return `<p style="color:${EMAIL_COLORS.muted};font-size:12px;">${escapeHtml(text)}</p>`;
}

export function plgEmailFooterHtml(href: string): string {
    return `<p style="margin:24px 0 0;font-size:11px;color:${EMAIL_COLORS.subtle};line-height:1.5;text-align:center;">
Review management powered by <a href="${href}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Zyene Reviews</a>
</p>`;
}

export function referralRewardEmailHtml(name: string): string {
    return `<p style="font-size:16px;color:${EMAIL_COLORS.body};">Hi ${escapeHtml(name)},</p>
<p style="font-size:16px;color:${EMAIL_COLORS.body};">Someone you referred just became a paying Zyene Reviews customer. We've applied a <strong>1-month account credit</strong> to your Stripe balance (or will reflect on your next invoice).</p>
<p style="font-size:16px;color:${EMAIL_COLORS.body};">Keep sharing your referral link from Settings → Billing.</p>
<p style="font-size:13px;color:${EMAIL_COLORS.subtle};"> - The Zyene Reviews Team</p>`;
}

export function reputationScoreEmailHtml(metrics: {
    name: string;
    averageRating: number;
    totalReviews: number;
}): string {
    return `<h2 style="font-size:20px;color:${EMAIL_COLORS.heading};">${escapeHtml(metrics.name)}</h2>
<ul style="font-size:16px;color:${EMAIL_COLORS.body};line-height:1.8;">
<li><strong>Google rating:</strong> ${metrics.averageRating.toFixed(1)} / 5</li>
<li><strong>Review count:</strong> ${metrics.totalReviews}</li>
<li>Response coverage requires connected review data and is not available in this public snapshot.</li>
</ul>
<p style="font-size:14px;color:${EMAIL_COLORS.muted};">Track competitors, automate requests, and reply with AI in Zyene Reviews - <a href="${AUTH_SIGNUP_URL}?utm_source=free_tool&utm_medium=reputation_score">free 7-day trial</a>.</p>`;
}

export function reviewLinkEmailHtml(name: string, reviewLink: string): string {
    return `<p style="font-size:16px;color:${EMAIL_COLORS.body};">Here is your direct Google review link for <strong>${escapeHtml(name)}</strong>:</p>
<p style="font-size:16px;"><a href="${escapeHtml(reviewLink)}" style="color:${EMAIL_COLORS.link};">${escapeHtml(reviewLink)}</a></p>
<p style="font-size:14px;color:${EMAIL_COLORS.muted};">Share this link via SMS, email, or QR code. Customers tap once to leave a review on Google.</p>
<p style="font-size:14px;color:${EMAIL_COLORS.muted};">Want automated requests and AI replies? <a href="${AUTH_SIGNUP_URL}?utm_source=free_tool&utm_medium=review_link">Start a 7-day free trial</a>.</p>`;
}

export function reviewResponseBonusEmailHtml(primary: string, bonusHtml: string): string {
    return `<p style="font-size:16px;color:${EMAIL_COLORS.body};">Your draft reply:</p>
<blockquote style="border-left:3px solid ${EMAIL_COLORS.border};padding-left:12px;color:${EMAIL_COLORS.body};">${escapeHtml(primary)}</blockquote>
<h3 style="font-size:16px;color:${EMAIL_COLORS.heading};">5 bonus templates</h3>
${bonusHtml}
<p style="font-size:14px;color:${EMAIL_COLORS.muted};"><a href="${AUTH_SIGNUP_URL}?utm_source=free_tool&utm_medium=review_response">Try AI replies in your brand voice</a> - 7-day free trial.</p>`;
}

export function reviewResponseBonusItemHtml(label: string, text: string): string {
    return `<p style="font-size:14px;color:${EMAIL_COLORS.body};"><strong>${escapeHtml(label)}</strong><br/>${escapeHtml(text)}</p>`;
}
