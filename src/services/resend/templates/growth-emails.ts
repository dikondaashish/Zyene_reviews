// ─────────────────────────────────────────────────────────────────────────────
// Growth / lifecycle email templates — Phase 6
// ─────────────────────────────────────────────────────────────────────────────

interface GrowthEmailLayoutProps {
    userName: string;
    bodyHtml: string;
    ctaLabel?: string;
    ctaUrl?: string;
}

function growthEmailLayout({ userName, bodyHtml, ctaLabel, ctaUrl }: GrowthEmailLayoutProps): string {
    const ctaBlock =
        ctaLabel && ctaUrl
            ? `<a href="${ctaUrl}" style="display:inline-block;background-color:#18181b;color:#ffffff;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;margin-top:24px;">${ctaLabel}</a>`
            : "";

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fcfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fcfbfa;">
<tr><td align="center" style="padding:40px 20px;">
<table width="100%" style="max-width:600px;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
<tr><td style="padding:32px 40px 48px;">
<img src="https://zyenereviews.com/logo.png" alt="Zyene Reviews" width="160" style="display:block;margin:0 auto 32px;">
<p style="margin:0 0 16px;font-size:16px;color:#52525b;">Hi ${userName},</p>
${bodyHtml}
${ctaBlock}
<p style="margin:32px 0 0;font-size:13px;color:#a1a1aa;line-height:1.5;">— The Zyene Reviews Team</p>
</td></tr></table>
</td></tr></table>
</body></html>`;
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
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Your 7-day trial is live. The fastest win today: <strong>connect your Google Business Profile</strong> so new reviews sync automatically and you get instant alerts.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">It takes about 2 minutes from your dashboard.</p>`,
            cta: "Connect Google",
        },
        trial_day2_first_request: {
            subject: "Day 2: Send your first review request",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Happy customers often forget to leave a review. Send your first request via <strong>SMS, email, or a shareable link</strong> — right after a great visit.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Most businesses see their first new Google review within 48 hours of sending requests.</p>`,
            cta: "Send a review request",
        },
        trial_day3_ai_replies: {
            subject: "Day 3: Reply to reviews in one click with AI",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Responding shows you care — and helps your local SEO. Use <strong>AI reply suggestions</strong> to draft professional responses in seconds. You review and post every reply.</p>`,
            cta: "Open your review inbox",
        },
        trial_day4_feedback_shield: {
            subject: "Day 4: Protect your rating with the Negative Feedback Shield",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Customers who rate 1–3 stars are routed to a <strong>private feedback form</strong> first, so you can resolve issues before they hit Google publicly.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">4–5 star customers are guided to leave a public review. This is included on every paid plan.</p>`,
            cta: "See how it works",
        },
        trial_day5_competitors: {
            subject: "Day 5: See how you stack up against competitors",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Add nearby competitors and track their review count and rating vs. yours. You'll know exactly how many reviews you need to catch up.</p>`,
            cta: "Add competitors",
        },
        trial_day6_case_study: {
            subject: "Day 6: How Sunrise Dental grew from 23 to 89 Google reviews",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Sunrise Dental used automated SMS requests and the Negative Feedback Shield to grow from 4.1 to 4.7 stars in 90 days — without hiring marketing staff.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="https://zyenereviews.com/case-studies/sunrise-dental-austin" style="color:#16a34a;">Read the full case study →</a></p>`,
            cta: "Go to dashboard",
        },
        trial_day7_upgrade: {
            subject: "Day 7: Your trial ends soon — keep your momentum",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Your free trial is wrapping up. Keep your review automation, AI replies, and competitor tracking for <strong>$29.99/mo</strong> — no annual contract.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Cancel anytime from billing settings if Zyene isn't the right fit.</p>`,
            cta: "View plans",
        },
    };

    const step = steps[stepKey] ?? steps.trial_day1_connect_google;
    return {
        subject: step.subject,
        html: growthEmailLayout({
            userName,
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
            subject: "Welcome to paid — here's everything you unlocked",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for subscribing. You now have full access to your plan limits: review requests, AI replies, competitor tracking, and more.</p>`,
            cta: "Open dashboard",
        },
        convert_case_study: {
            subject: "How Wolfpack BBQ added 64 five-star reviews in 60 days",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Post-checkout SMS made review collection automatic. <a href="https://zyenereviews.com/case-studies/wolfpack-bbq-charlotte" style="color:#16a34a;">Read their story →</a></p>`,
            cta: "Send your next campaign",
        },
        convert_pricing_reminder: {
            subject: "Getting the most from your Zyene plan",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Check your usage in Settings → Billing. Need more locations? Professional supports up to 3 with independent limits per location.</p>`,
            cta: "Manage billing",
        },
        convert_engagement_check: {
            subject: "Need help setting up auto-replies or widgets?",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Reply to this email if you want help configuring auto-commenter, embeddable widgets, or Zapier — we'll walk you through it.</p>`,
            cta: "Contact support",
        },
    };
    const step = steps[stepKey] ?? steps.convert_benefits_recap;
    return {
        subject: step.subject,
        html: growthEmailLayout({ userName, bodyHtml: step.body, ctaLabel: step.cta, ctaUrl: dashboardUrl }),
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
        subject: "We miss you — here's what's new at Zyene Reviews",
        html: growthEmailLayout({
            userName,
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Since you left, we've shipped competitor benchmarks, improved AI replies, industry playbooks, and more case studies from businesses like yours.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Come back with <strong>25% off your next 3 months</strong> on any plan — reply to this email or reactivate below.</p>`,
            ctaLabel: "Reactivate with 25% off",
            ctaUrl: rejoinUrl,
        }),
    };
}

export function newsletterWelcomeEmail({ email }: { email: string }): { subject: string; html: string } {
    return {
        subject: "You're subscribed to Zyene Reviews Monthly",
        html: growthEmailLayout({
            userName: "there",
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for subscribing (<strong>${email}</strong>). Once a month you'll get product updates, Google review tips, and new case studies for local business owners.</p>`,
            ctaLabel: "Read the blog",
            ctaUrl: "https://zyenereviews.com/blog",
        }),
    };
}
