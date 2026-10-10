import { growthEmailLayout } from "@/services/resend/templates/growth-emails";

const PACK_URL = "https://zyenereviews.com/resources/review-request-templates";

export function reviewRequestTemplatePackEmail({
    unsubscribeUrl,
}: {
    unsubscribeUrl: string;
}): { subject: string; html: string } {
    return {
        subject: "Your Review Request Template Pack",
        html: growthEmailLayout({
            userName: "there", title: "Your review request template pack", unsubscribeUrl,
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for requesting the review request template pack. Open the web version below and copy the scripts you need.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="${PACK_URL}" style="color:#2563eb;font-weight:600;">Open your 22 templates →</a></p>
<h2 style="font-size:18px;color:#18181b;margin:24px 0 8px;">What&apos;s inside</h2>
<ul style="font-size:16px;line-height:1.6;color:#52525b;padding-left:20px;margin:0 0 16px;">
<li><strong>SMS templates</strong> - short, direct scripts after a visit or job</li>
<li><strong>Email templates</strong> - follow-ups with a clear subject line and review link</li>
<li><strong>Reminders &amp; thank-yous</strong> - one polite follow-up and post-review notes</li>
</ul>
<h2 style="font-size:18px;color:#18181b;margin:24px 0 8px;">Compliance reminder</h2>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Do not offer discounts or gifts for positive reviews. Do not ask only happy customers for reviews. Keep outreach fair, honest, and proportional - at most one polite reminder per visit.</p>
`,
            ctaLabel: "Open the template pack",
            ctaUrl: PACK_URL,
        }),
    };
}
