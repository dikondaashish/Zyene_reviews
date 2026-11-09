import { emailButton, emailLayout, emailParagraph, emailSettingsFooter } from "@/lib/email/email-layout";

interface GrowthEmailLayoutProps {
    userName: string; bodyHtml: string; title?: string; preheader?: string;
    ctaLabel?: string; ctaUrl?: string; unsubscribeUrl?: string;
}

export function growthEmailLayout({ userName, bodyHtml, title = "Your Zyene Reviews update", preheader, ctaLabel, ctaUrl, unsubscribeUrl }: GrowthEmailLayoutProps): string {
    return emailLayout({
        title, preheader: preheader ?? title,
        bodyHtml: emailParagraph(`Hi ${userName},`) + bodyHtml
            + (ctaLabel && ctaUrl ? emailButton(ctaLabel, ctaUrl) : ""),
        footerHtml: unsubscribeUrl ? emailSettingsFooter(unsubscribeUrl, "Unsubscribe from marketing emails") : undefined,
    });
}

export interface TrialNurtureEmailProps {
    userName: string;
    dashboardUrl: string;
    stepKey: string;
    unsubscribeUrl?: string;
}

export function trialNurtureEmail({ userName, dashboardUrl, stepKey, unsubscribeUrl }: TrialNurtureEmailProps): { subject: string; html: string } {
    const steps: Record<string, { subject: string; body: string; cta: string }> = {
        trial_day2_first_request: {
            subject: "Day 2: Send your first review request",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Invite customers to share honest feedback via <strong>SMS, email, or a shareable link</strong> after their visit.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Use a clear, personal message and give every customer the same opportunity to leave a review.</p>`,
            cta: "Send a review request",
        },
        trial_day7_upgrade: {
            subject: "Day 7: Review your plan and next steps",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Check your dashboard for your current plan, trial status, billing dates, and available features.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Cancel anytime from billing settings if Zyene isn't the right fit.</p>`,
            cta: "View plans",
        },
    };

    const step = steps[stepKey] ?? steps.trial_day2_first_request;
    return {
        subject: step.subject,
        html: growthEmailLayout({
            userName, title: step.subject, unsubscribeUrl,
            bodyHtml: step.body,
            ctaLabel: step.cta,
            ctaUrl: dashboardUrl,
        }),
    };
}

export function winbackFollowUpEmail({
    userName,
    rejoinUrl, unsubscribeUrl,
}: {
    userName: string;
    rejoinUrl: string;
    unsubscribeUrl?: string;
}): { subject: string; html: string } {
    return {
        subject: "We miss you - here's what's new at Zyene Reviews",
        html: growthEmailLayout({
            userName, title: "Ready to return to Zyene Reviews?", unsubscribeUrl,
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Explore review requests, reply tools, and competitor benchmarks available with Zyene Reviews.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Your billing page shows current plans, prices, and any available offers. Contact our team if you need help choosing a plan.</p>`,
            ctaLabel: "View available plans",
            ctaUrl: rejoinUrl,
        }),
    };
}
