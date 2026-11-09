import { EMAIL_BRAND } from "@/lib/email/email-brand";
import { growthEmailLayout } from "@/services/resend/templates/growth-emails";
import { escapeHtml } from "@/lib/security/html-escape";

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
            ctaUrl: "https://www.zyenereviews.com/blog",
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
<p style="font-size:16px;line-height:1.6;color:#52525b;"><a href="${escapeHtml(caseStudyLink)}" style="color:${EMAIL_BRAND.link};">${escapeHtml(caseStudyTitle)} →</a></p>
`,
            ctaLabel: "Start your free trial",
            ctaUrl: "https://www.zyenereviews.com/pricing",
        }),
    };
}
