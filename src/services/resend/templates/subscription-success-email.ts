import { emailButton, emailLayout, emailParagraph } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

interface SubscriptionSuccessEmailProps {
    userName: string; planName: string; isTrial: boolean; dashboardUrl: string;
}

export function subscriptionSuccessEmail({ userName, planName, isTrial, dashboardUrl }: SubscriptionSuccessEmailProps): string {
    const title = isTrial ? `Your ${planName} trial has started` : `Your ${planName} plan is active`;
    return emailLayout({
        title,
        preheader: "Check your plan, included features, and billing dates in your dashboard.",
        eyebrow: isTrial ? "Trial confirmation" : "Subscription confirmation",
        bodyHtml: emailParagraph(`Hi ${userName},`)
            + emailParagraph(isTrial
                ? `Your free trial of the ${planName} plan is active. Your dashboard shows your trial end date and what happens next.`
                : `Your subscription to the ${planName} plan is active. Thank you for choosing Zyene Reviews.`)
            + emailButton(isTrial ? "Explore your trial" : "Open your dashboard", dashboardUrl)
            + `<h2 style="margin:24px 0 12px;font-size:18px;color:#18181b;">Make the most of ${escapeHtml(planName)}</h2>
<ul style="padding-left:24px;line-height:1.8;">
<li>Connect your review platforms.</li>
<li>Explore the review requests and reply tools included in your plan.</li>
<li>Check your usage and billing details in Settings → Billing.</li>
</ul>`,
    });
}
