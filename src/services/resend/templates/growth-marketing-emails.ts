import { getAuthSiteUrl } from "@/lib/routing/platform-routes";
import { growthEmailLayout } from "./growth-emails";

const AUTH_SIGNUP_URL = getAuthSiteUrl(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com",
    "/signup"
);

export function marketingNurtureEmail({
    email,
    stepKey,
}: {
    email: string;
    stepKey: string;
}): { subject: string; html: string } {
    const steps: Record<string, { subject: string; body: string; cta: string; url: string }> = {
        marketing_nurture_day0_guide: {
            subject: "Start here: our best guide for more Google reviews",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for subscribing. If you want one place to start, read our <strong>review request template pack</strong> and <strong>local SEO checklist</strong>—both are free on the site.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">You're receiving this at <strong>${email}</strong> because you joined our marketing list.</p>`,
            cta: "Open the template pack",
            url: "https://zyenereviews.com/resources/review-request-templates",
        },
        marketing_nurture_day2_shield: {
            subject: "Resolve complaints privately before they hit Google",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Unhappy customers often post on Google before you hear from them. <strong>Negative Feedback Shield</strong> routes low scores to a private form first so you can fix issues—without review gating or suppressing honest public feedback.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="https://zyenereviews.com/blog/negative-feedback-shield" style="color:#16a34a;">Read how Shield works →</a></p>`,
            cta: "See review collection",
            url: "https://zyenereviews.com/features/review-collection",
        },
        marketing_nurture_day5_trial: {
            subject: "Automate review requests in one inbox",
            body: `<p style="font-size:16px;line-height:1.6;color:#52525b;">When manual texts stop scaling, Zyene Reviews sends SMS and email campaigns, alerts you on new reviews, and helps you reply faster—with Shield included on paid plans.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Plans from <strong>$29.99/mo</strong>, month-to-month. No annual contract required.</p>`,
            cta: "Start 7-day free trial",
            url: AUTH_SIGNUP_URL,
        },
    };
    const step = steps[stepKey] ?? steps.marketing_nurture_day0_guide;
    return {
        subject: step.subject,
        html: growthEmailLayout({
            userName: "there",
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
            userName: "there",
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for subscribing (<strong>${email}</strong>). Once a month you'll get product updates, Google review tips, and new case studies for local business owners.</p>
<p style="font-size:12px;color:#a1a1aa;margin-top:24px;"><a href="${unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe</a></p>`,
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
        subject: `Zyene Reviews Monthly — ${monthLabel}`,
        html: growthEmailLayout({
            userName: "there",
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;"><strong>Product update:</strong> ${productUpdate}</p>
<h3 style="font-size:18px;color:#18181b;margin:24px 0 8px;">${tipTitle}</h3>
<p style="font-size:16px;line-height:1.6;color:#52525b;">${tipBody}</p>
<h3 style="font-size:18px;color:#18181b;margin:24px 0 8px;">Case study</h3>
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="${caseStudyLink}" style="color:#16a34a;">${caseStudyTitle} →</a></p>
<p style="font-size:12px;color:#a1a1aa;margin-top:32px;"><a href="${unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe from Zyene Reviews Monthly</a></p>`,
            ctaLabel: "Start your free trial",
            ctaUrl: "https://zyenereviews.com/pricing",
        }),
    };
}
