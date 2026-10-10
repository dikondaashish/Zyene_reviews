/** Inline email colors and templates used by free tools and referrals. */
import { escapeHtml } from "@/lib/security/html-escape";
import { getAuthSiteUrl } from "@/lib/routing/platform-routes";
import { emailButton, emailLayout, emailPanel, emailParagraph } from "@/lib/email/email-layout";

const AUTH_SIGNUP_URL = getAuthSiteUrl(process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com", "/signup");
export const EMAIL_COLORS = {
    body: "#52525b", muted: "#52525b", subtle: "#52525b",
    heading: "#18181b", border: "#e4e4e7", link: "#2563eb",
} as const;

export function emailMutedFooter(text: string): string {
    return `<p class="email-muted" style="color:${EMAIL_COLORS.muted};font-size:13px;">${escapeHtml(text)}</p>`;
}

export function plgEmailFooterHtml(href: string): string {
    return `<p class="email-muted" style="margin:24px 0 0;font-size:13px;color:${EMAIL_COLORS.muted};line-height:1.5;text-align:center;">
Review management powered by <a href="${escapeHtml(href)}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Zyene Reviews</a></p>`;
}

export function referralRewardEmailHtml(name: string): string {
    return emailLayout({
        title: "Your referral reward is ready",
        preheader: "A customer you referred subscribed. Check your billing credit.",
        bodyHtml: emailParagraph(`Hi ${name},`)
            + emailParagraph("Someone you referred just became a paying Zyene Reviews customer. We've applied a one-month account credit to your Stripe balance. Check Settings → Billing for your credit and next invoice.")
            + emailParagraph("You can find your referral link in Settings → Billing."),
    });
}

export function reputationScoreEmailHtml(metrics: { name: string; averageRating: number; totalReviews: number }): string {
    return emailLayout({
        title: `Your reputation snapshot for ${metrics.name}`,
        preheader: "Your public Google rating and review count, together in one snapshot.",
        bodyHtml: emailPanel(emailParagraph(`Google rating: ${metrics.averageRating.toFixed(1)} out of 5`)
            + emailParagraph(`Review count: ${metrics.totalReviews}`))
            + emailParagraph("Response coverage requires connected review data and is not available in this public snapshot.")
            + emailButton("Explore Zyene Reviews", `${AUTH_SIGNUP_URL}?utm_source=free_tool&utm_medium=reputation_score`),
    });
}

export function reviewLinkEmailHtml(name: string, reviewLink: string): string {
    return emailLayout({
        title: `Your Google review link for ${name}`,
        preheader: "Save this link to share with customers after a visit.",
        bodyHtml: emailParagraph("Here is your direct Google review link:")
            + `<p style="word-break:break-all;"><a href="${escapeHtml(reviewLink)}" style="color:#2563eb;text-decoration:underline;">${escapeHtml(reviewLink)}</a></p>`
            + emailParagraph("Share this link via SMS, email, or a QR code. Invite honest feedback from every customer.")
            + emailButton("Explore automated requests", `${AUTH_SIGNUP_URL}?utm_source=free_tool&utm_medium=review_link`),
    });
}

export function reviewResponseBonusEmailHtml(primary: string, bonusHtml: string): string {
    return emailLayout({
        title: "Your review reply and bonus templates",
        preheader: "A draft response and five templates you can adapt to your business.",
        bodyHtml: emailParagraph("Your draft reply:") + emailPanel(emailParagraph(primary))
            + `<h2 style="font-size:18px;color:#18181b;margin:24px 0 12px;">5 bonus templates</h2>${bonusHtml}`
            + emailParagraph("Check the details and adapt each reply before publishing it.")
            + emailButton("Explore reply tools", `${AUTH_SIGNUP_URL}?utm_source=free_tool&utm_medium=review_response`),
    });
}

export function reviewResponseBonusItemHtml(label: string, text: string): string {
    return `<p style="font-size:14px;line-height:1.6;color:${EMAIL_COLORS.body};"><strong>${escapeHtml(label)}</strong><br>${escapeHtml(text)}</p>`;
}
