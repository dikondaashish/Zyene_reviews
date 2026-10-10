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
}

export function trialNurtureEmail({ userName, dashboardUrl, stepKey }: TrialNurtureEmailProps): { subject: string; html: string } {
    const steps: Record<string, { subject: string; body: string; cta: string }> = {
        trial_day1_connect_google: {
            subject: "Day 1: Connect Google and see every review in one inbox",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Start with your account setup: <strong>connect your Google Business Profile</strong> so new reviews sync automatically and you get instant alerts.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Follow the connection steps in your dashboard.</p>`,
            cta: "Connect Google",
        },
        trial_day2_first_request: {
            subject: "Day 2: Send your first review request",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Invite customers to share honest feedback via <strong>SMS, email, or a shareable link</strong> after their visit.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Use a clear, personal message and give every customer the same opportunity to leave a review.</p>`,
            cta: "Send a review request",
        },
        trial_day3_ai_replies: {
            subject: "Day 3: Reply to reviews in one click with AI",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Responding shows customers you care. Use <strong>AI reply suggestions</strong> to draft professional responses in seconds. You review and post every reply.</p>`,
            cta: "Open your review inbox",
        },
        trial_day4_feedback_shield: {
            subject: "Day 4: Follow up on customer feedback",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Customers who rate 1-3 stars can use a <strong>private feedback form</strong> to describe the problem, and your team receives an alert for follow-up.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Keep public review requests fair for your customer base. This is included on every paid plan.</p>`,
            cta: "See how it works",
        },
        trial_day5_competitors: {
            subject: "Day 5: See how you stack up against competitors",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Add nearby competitors and track their review count and rating vs. yours. Use those benchmarks to understand how your review profile compares.</p>`,
            cta: "Add competitors",
        },
        trial_day6_case_study: {
            subject: "Day 6: How Sunrise Dental grew from 23 to 89 Google reviews",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Sunrise Dental used automated SMS requests and the Negative Feedback Shield to grow from 4.1 to 4.7 stars in 90 days - without hiring marketing staff.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="https://zyenereviews.com/case-studies/sunrise-dental-austin" style="color:#2563eb;">Read the full case study →</a></p>`,
            cta: "Go to dashboard",
        },
        trial_day7_upgrade: {
            subject: "Day 7: Review your plan and next steps",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Check your dashboard for your current plan, trial status, billing dates, and available features.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Cancel anytime from billing settings if Zyene isn't the right fit.</p>`,
            cta: "View plans",
        },
    };

    const step = steps[stepKey] ?? steps.trial_day1_connect_google;
    return {
        subject: step.subject,
        html: growthEmailLayout({
            userName, title: step.subject,
            bodyHtml: step.body,
            ctaLabel: step.cta,
            ctaUrl: dashboardUrl,
        }),
    };
}

export function onboardingDripEmail({
    userName,
    dashboardUrl,
    stepKey,
}: TrialNurtureEmailProps): { subject: string; html: string } {
    const steps: Record<string, { subject: string; body: string; cta: string }> = {
        convert_benefits_recap: {
            subject: "Your plan is active: explore your features",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for subscribing. You now have full access to your plan limits: review requests, AI replies, competitor tracking, and more.</p>`,
            cta: "Open dashboard",
        },
        convert_case_study: {
            subject: "How Wolfpack BBQ added 64 five-star reviews in 60 days",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Post-checkout SMS made review collection automatic. <a href="https://zyenereviews.com/case-studies/wolfpack-bbq-charlotte" style="color:#2563eb;">Read their story →</a></p>`,
            cta: "Send your next campaign",
        },
        convert_pricing_reminder: {
            subject: "Getting the most from your Zyene plan",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Check your usage in Settings → Billing. Your billing page shows the location and usage limits included in your plan.</p>`,
            cta: "Manage billing",
        },
        convert_last_chance_offer: {
            subject: "Review your plan before your next billing cycle",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">You're on a paid plan - keep your review automation, AI replies, and competitor tracking active. <a href="https://zyenereviews.com/pricing" style="color:#2563eb;">Review plan options →</a> or reply if you need help before your next billing cycle.</p>`,
            cta: "Manage billing",
        },
    };
    const step = steps[stepKey] ?? steps.convert_benefits_recap;
    return {
        subject: step.subject,
        html: growthEmailLayout({ userName, title: step.subject, bodyHtml: step.body, ctaLabel: step.cta, ctaUrl: dashboardUrl }),
    };
}

export function winbackFollowUpEmail({
    userName,
    rejoinUrl,
}: {
    userName: string;
    rejoinUrl: string;
}): { subject: string; html: string } {
    return {
        subject: "We miss you - here's what's new at Zyene Reviews",
        html: growthEmailLayout({
            userName, title: "Ready to return to Zyene Reviews?",
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Explore review requests, reply tools, and competitor benchmarks available with Zyene Reviews.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Your billing page shows current plans, prices, and any available offers. Contact our team if you need help choosing a plan.</p>`,
            ctaLabel: "View available plans",
            ctaUrl: rejoinUrl,
        }),
    };
}
