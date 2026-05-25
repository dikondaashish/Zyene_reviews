import { growthEmailLayout } from "./growth-emails";

const PACK_URL = "https://zyenereviews.com/resources/review-request-templates";

export function reviewRequestTemplatePackEmail({
    unsubscribeUrl,
}: {
    unsubscribeUrl: string;
}): { subject: string; html: string } {
    return {
        subject: "Your Review Request Template Pack",
        html: growthEmailLayout({
            userName: "there",
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for requesting the review request template pack. <strong>The web version is ready here</strong>—no PDF attachment yet; copy any script directly from the page.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="${PACK_URL}" style="color:#16a34a;font-weight:600;">Open your 22 templates →</a></p>
<h3 style="font-size:18px;color:#18181b;margin:24px 0 8px;">What&apos;s inside</h3>
<ul style="font-size:16px;line-height:1.6;color:#52525b;padding-left:20px;margin:0 0 16px;">
<li><strong>SMS templates</strong> — short, direct scripts after a visit or job</li>
<li><strong>Email templates</strong> — follow-ups with a clear subject line and review link</li>
<li><strong>Reminders &amp; thank-yous</strong> — one polite follow-up and post-review notes</li>
</ul>
<h3 style="font-size:18px;color:#18181b;margin:24px 0 8px;">Compliance reminder</h3>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Do not offer discounts or gifts for positive reviews. Do not ask only happy customers for reviews. Keep outreach fair, honest, and proportional—at most one polite reminder per visit.</p>
<p style="font-size:12px;color:#a1a1aa;margin-top:24px;"><a href="${unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe</a></p>`,
            ctaLabel: "Open the template pack",
            ctaUrl: PACK_URL,
        }),
    };
}
