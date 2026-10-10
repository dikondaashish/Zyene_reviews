import { describe, expect, it } from "vitest";
import { emailHtmlToText } from "@/lib/email/html-to-text";
import { emailPreviews } from "../fixtures/email-previews";
import { reviewRequestEmail, reviewRequestEmailPlainText } from "@/services/resend/templates/review-request-email";
import { monthlyNewsletterEmail, newsletterWelcomeEmail } from "@/services/resend/templates/growth-marketing-emails";
import { aeoAlertDigestEmail } from "@/services/resend/templates/aeo-alert-digest-email";
import { supabaseAuthEmailTemplates } from "@/lib/email/supabase-auth-templates";

const payload = '<img src=x onerror="alert(1)">';
const request = { customerName: "Alex", businessName: "A & B", reviewLink: "https://collectratings.com/r/example?request=synthetic&source=email" };

describe("email content and fallback behavior", () => {
    it.each(emailPreviews())("$id has a readable document and working destination attributes", preview => {
        expect(preview.html).toMatch(/<html lang="en"/i);
        expect(preview.html).toContain('name="viewport"');
        expect(preview.html).not.toMatch(/href=["']#?["']/);
        expect(preview.html).not.toMatch(/\{(?:customer_name|business_name|review_link|sender_name)\}/);
        const text = emailHtmlToText(preview.html);
        expect(text.length).toBeGreaterThan(30);
        expect(text).not.toContain("@media");
        expect(text).not.toContain("<!--[if mso]");
    });

    it("uses a custom plain-text request in both message alternatives", () => {
        const props = { ...request, template: "Hello {customer_name},\nA personal note from {business_name}.\n{review_link}" };
        expect(reviewRequestEmail(props)).toContain("A personal note from A &amp; B.");
        expect(reviewRequestEmail(props)).toContain('href="https://collectratings.com/r/example?request=synthetic&amp;source=email"');
        expect(reviewRequestEmailPlainText(props)).toContain("A personal note from A & B.");
    });

    it("keeps customer-authored values as text inside merchant-authored markup", () => {
        const html = reviewRequestEmail({ ...request, customerName: payload, businessName: payload,
            reviewLink: 'https://collectratings.com/r/example?q=" onclick="alert(1)', template: '<p>{customer_name} at {business_name}</p><a href="{review_link}">Review</a>' });
        expect(html).not.toContain(payload);
        expect(html).toContain("&lt;img");
        expect(html).not.toContain('" onclick="');
    });

    it("preserves replacement characters and removes HTML from the plain-text alternative", () => {
        const props = { ...request, customerName: "$& Alex", template: '<p>Hi {customer_name},</p><p><a href="{review_link}">Share feedback</a></p>' };
        expect(reviewRequestEmail(props)).toContain("$&amp; Alex");
        expect(reviewRequestEmailPlainText(props)).toContain("$& Alex");
        expect(reviewRequestEmailPlainText(props)).not.toContain("<p>");
        expect(reviewRequestEmailPlainText(props)).toContain(request.reviewLink);
    });

    it("encodes newsletter text, headings, email addresses, and link attributes", () => {
        const html = monthlyNewsletterEmail({ monthLabel: payload, productUpdate: payload, tipTitle: payload,
            tipBody: payload, caseStudyLink: 'https://example.test/?q=" onclick="x', caseStudyTitle: payload, unsubscribeUrl: "https://example.test/unsubscribe" }).html;
        expect(html).not.toContain(payload);
        expect(html).not.toContain('" onclick="');
        expect(newsletterWelcomeEmail({ email: payload, unsubscribeUrl: "https://example.test/unsubscribe" }).html).not.toContain(payload);
    });

    it("encodes stored AI alert evidence and copy", () => {
        const html = aeoAlertDigestEmail({ businessName: payload, totalCount: 1,
            dashboardUrl: "https://example.test", settingsUrl: "https://example.test/settings",
            alerts: [{ severity: "high", title: payload, detail: payload, evidenceUrl: 'https://example.test/?q=" onclick="x' }] });
        expect(html).not.toContain(payload);
        expect(html).not.toContain('" onclick="');
    });

    it("keeps provider authentication links and verification codes intact", () => {
        const templates = supabaseAuthEmailTemplates();
        expect(templates).toHaveLength(13);
        for (const template of templates.slice(0, 5)) expect(template.html).toContain('href="{{ .ConfirmationURL }}"');
        expect(templates.find(template => template.slug === "reauthentication")?.html).toContain("{{ .Token }}");
    });

    it("retains action URLs without CSS or hidden preview text", () => {
        const html = '<head><style>body{color:red}</style></head><div aria-hidden="true">Hidden preview</div><p>A &amp; B</p><p><a href="https://example.test/?a=1&amp;b=2">Open dashboard</a></p>';
        expect(emailHtmlToText(html)).toBe("A & B\n\nOpen dashboard (https://example.test/?a=1&b=2)");
    });
});
