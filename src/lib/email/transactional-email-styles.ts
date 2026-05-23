/**
 * Inline hex colors for transactional / marketing emails.
 * Email clients require explicit values — keep them centralized here.
 */

export const EMAIL_COLORS = {
    body: "#52525b",
    muted: "#71717a",
    subtle: "#a1a1aa",
    heading: "#18181b",
    border: "#e4e4e7",
    link: "#16a34a",
} as const;

export function emailMutedFooter(text: string): string {
    return `<p style="color:${EMAIL_COLORS.muted};font-size:12px;">${text}</p>`;
}

export function plgEmailFooterHtml(href: string): string {
    return `<p style="margin:24px 0 0;font-size:11px;color:${EMAIL_COLORS.subtle};line-height:1.5;text-align:center;">
Review management powered by <a href="${href}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Zyene Reviews</a>
</p>`;
}

export function referralRewardEmailHtml(name: string): string {
    return `<p style="font-size:16px;color:${EMAIL_COLORS.body};">Hi ${name},</p>
<p style="font-size:16px;color:${EMAIL_COLORS.body};">Someone you referred just became a paying Zyene Reviews customer. We've applied a <strong>1-month account credit</strong> to your Stripe balance (or will reflect on your next invoice).</p>
<p style="font-size:16px;color:${EMAIL_COLORS.body};">Keep sharing your referral link from Settings → Refer a friend.</p>
<p style="font-size:13px;color:${EMAIL_COLORS.subtle};">— The Zyene Reviews Team</p>`;
}

export function reputationScoreEmailHtml(metrics: {
    name: string;
    averageRating: number;
    totalReviews: number;
    estimatedResponseRatePct: number;
}): string {
    return `<h2 style="font-size:20px;color:${EMAIL_COLORS.heading};">${metrics.name}</h2>
<ul style="font-size:16px;color:${EMAIL_COLORS.body};line-height:1.8;">
<li><strong>Google rating:</strong> ${metrics.averageRating.toFixed(1)} / 5</li>
<li><strong>Review count:</strong> ${metrics.totalReviews}</li>
<li><strong>Estimated response rate:</strong> ~${metrics.estimatedResponseRatePct}% (public-data estimate)</li>
</ul>
<p style="font-size:14px;color:${EMAIL_COLORS.muted};">Track competitors, automate requests, and reply with AI in Zyene Reviews — <a href="https://zyenereviews.com/signup?utm_source=free_tool&utm_medium=reputation_score">free 7-day trial</a>.</p>`;
}

export function reviewLinkEmailHtml(name: string, reviewLink: string): string {
    return `<p style="font-size:16px;color:${EMAIL_COLORS.body};">Here is your direct Google review link for <strong>${name}</strong>:</p>
<p style="font-size:16px;"><a href="${reviewLink}" style="color:${EMAIL_COLORS.link};">${reviewLink}</a></p>
<p style="font-size:14px;color:${EMAIL_COLORS.muted};">Share this link via SMS, email, or QR code. Customers tap once to leave a review on Google.</p>
<p style="font-size:14px;color:${EMAIL_COLORS.muted};">Want automated requests and AI replies? <a href="https://zyenereviews.com/signup?utm_source=free_tool&utm_medium=review_link">Start a 7-day free trial</a>.</p>`;
}

export function reviewResponseBonusEmailHtml(primary: string, bonusHtml: string): string {
    return `<p style="font-size:16px;color:${EMAIL_COLORS.body};">Your draft reply:</p>
<blockquote style="border-left:3px solid ${EMAIL_COLORS.border};padding-left:12px;color:${EMAIL_COLORS.body};">${primary}</blockquote>
<h3 style="font-size:16px;color:${EMAIL_COLORS.heading};">5 bonus templates</h3>
${bonusHtml}
<p style="font-size:14px;color:${EMAIL_COLORS.muted};"><a href="https://zyenereviews.com/signup?utm_source=free_tool&utm_medium=review_response">Try AI replies in your brand voice</a> — 7-day free trial.</p>`;
}

export function reviewResponseBonusItemHtml(label: string, text: string): string {
    return `<p style="font-size:14px;color:${EMAIL_COLORS.body};"><strong>${label}</strong><br/>${text}</p>`;
}
