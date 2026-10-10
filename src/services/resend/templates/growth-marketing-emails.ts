import { getAuthSiteUrl } from "@/lib/routing/platform-routes";
import { growthEmailLayout } from "@/services/resend/templates/growth-emails";
import { escapeHtml } from "@/lib/security/html-escape";

const AUTH_SIGNUP_URL = getAuthSiteUrl(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com",
    "/signup"
);

export function marketingNurtureEmail({
    email,
    stepKey, unsubscribeUrl,
}: {
    email: string;
    stepKey: string;
    unsubscribeUrl?: string;
}): { subject: string; html: string } {
    const steps: Record<string, { subject: string; body: string; cta: string; url: string }> = {
        marketing_nurture_day0_guide: {
            subject: "Start here: our best guide for more Google reviews",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for subscribing. If you want one place to start, read our <strong>review request template pack</strong> and <strong>local SEO checklist</strong> - both are free on the site.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">You're receiving this at <strong>${escapeHtml(email)}</strong> because you joined our marketing list.</p>`,
            cta: "Open the template pack",
            url: "https://zyenereviews.com/resources/review-request-templates",
        },
        marketing_nurture_day2_shield: {
            subject: "Follow up when a customer gives a low rating",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">When a customer gives a low rating through a Zyene review page, <strong>Negative Feedback Shield</strong> gives them a private form to describe the problem and alerts your team. Use it for follow-up, without review gating or suppressing honest public feedback.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="https://zyenereviews.com/blog/negative-feedback-shield" style="color:#2563eb;">Read how Shield works →</a></p>`,
            cta: "See review collection",
            url: "https://zyenereviews.com/features/review-collection",
        },
        marketing_nurture_day5_trial: {
            subject: "Automate review requests in one inbox",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">When manual texts stop scaling, Zyene Reviews sends SMS and email campaigns, alerts you on new reviews, and helps you reply faster - with Shield included on paid plans.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Plans from <strong>$29.99/mo</strong>, month-to-month. No annual contract required.</p>`,
            cta: "Start 7-day free trial",
            url: AUTH_SIGNUP_URL,
        },
    };
    const step = steps[stepKey] ?? steps.marketing_nurture_day0_guide;
    return {
        subject: step.subject,
        html: growthEmailLayout({
            userName: "there", title: step.subject, unsubscribeUrl,
            bodyHtml: step.body,
            ctaLabel: step.cta,
            ctaUrl: step.url,
        }),
    };
}

export function newsletterWelcomeEmail(params: {
    email: string;
    unsubscribeUrl: string;
}): { subject: string; html: string } {
    const { email, unsubscribeUrl } = params;
    return {
        subject: "You're subscribed to Zyene Reviews Monthly",
        html: growthEmailLayout({
            userName: "there", title: "Welcome to Zyene Reviews Monthly", unsubscribeUrl,
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for subscribing (<strong>${escapeHtml(email)}</strong>). Once a month you'll get product updates, Google review tips, and new case studies for local business owners.</p>
`,
            ctaLabel: "Read the blog",
            ctaUrl: "https://zyenereviews.com/blog",
        }),
    };
}

export function monthlyNewsletterEmail(params: {
    monthLabel: string;
    productUpdate: string;
    tipTitle: string;
    tipBody: string;
    caseStudyLink: string;
    caseStudyTitle: string;
    unsubscribeUrl: string;
}): { subject: string; html: string } {
    const { monthLabel, productUpdate, tipTitle, tipBody, caseStudyLink, caseStudyTitle, unsubscribeUrl } = params;
    return {
        subject: `Zyene Reviews Monthly - ${monthLabel}`,
        html: growthEmailLayout({
            userName: "there", title: `Zyene Reviews Monthly — ${monthLabel}`, unsubscribeUrl,
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;"><strong>Product update:</strong> ${escapeHtml(productUpdate)}</p>
<h2 style="font-size:18px;color:#18181b;margin:24px 0 8px;">${escapeHtml(tipTitle)}</h2>
<p style="font-size:16px;line-height:1.6;color:#52525b;">${escapeHtml(tipBody)}</p>
<h2 style="font-size:18px;color:#18181b;margin:24px 0 8px;">Case study</h2>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="${escapeHtml(caseStudyLink)}" style="color:#2563eb;">${escapeHtml(caseStudyTitle)} →</a></p>
`,
            ctaLabel: "Start your free trial",
            ctaUrl: "https://zyenereviews.com/pricing",
        }),
    };
}
