import { emailHtmlToText } from "@/lib/email/html-to-text";
import { escapeHtml } from "@/lib/security/html-escape";
import { reviewRequestLayout } from "@/lib/email/review-request-layout";

interface ReviewRequestEmailProps {
    customerName: string;
    businessName: string;
    reviewLink: string;
    template?: string;
    /** Optional first-person sender, e.g. "Sam". When provided we sign as this person. */
    senderName?: string;
}

function firstName(value: string | null | undefined): string {
    const cleaned = (value || "").trim().split(/\s+/)[0] || "";
    return cleaned;
}

/**
 * Plain-text alternative to the personal review request.
 */
export function reviewRequestEmailPlainText({
    customerName,
    businessName,
    reviewLink,
    template,
    senderName,
}: ReviewRequestEmailProps): string {
    const greeting = firstName(customerName) || "there";
    const sender = (senderName || "").trim();
    const signoff = sender ? sender : businessName;

    if (template) {
        const isHtml = /<[a-z][\s\S]*>/i.test(template);
        const value = (text: string) => isHtml ? escapeHtml(text) : text;
        const rendered = template
            .replace(/\{customer_name\}/g, () => value(customerName || ""))
            .replace(/\{business_name\}/g, () => value(businessName))
            .replace(/\{review_link\}/g, () => value(reviewLink))
            .replace(/\{sender_name\}/g, () => value(sender));
        return isHtml ? emailHtmlToText(rendered) : rendered;
    }

    const intro = sender
        ? `This is ${sender} from ${businessName}.`
        : `Hope you had a good visit to ${businessName}.`;

    return [
        `Hi ${greeting},`,
        "",
        intro,
        "",
        "If you have a minute, we'd love to hear how it went:",
        reviewLink,
        "",
        "Thank you for sharing your honest feedback.",
        "",
        "Thanks,",
        signoff,
    ].join("\n");
}

/**
 * Minimal HTML for one-to-one review requests. Plain-text vibe, single link,
 * keeps the business sender prominent without marketing chrome.
 */
export function reviewRequestEmail({
    customerName,
    businessName,
    reviewLink,
    template,
    senderName,
}: ReviewRequestEmailProps): string {
    if (template && template.includes("<") && template.includes(">")) {
        const values: Record<string, string> = { customer_name: customerName || "", business_name: businessName, review_link: reviewLink, sender_name: senderName || "" };
        const html = template.replace(/\{(customer_name|business_name|review_link|sender_name)\}/g,
            (_, key: string) => escapeHtml(values[key]));
        return /<html[\s>]/i.test(html) ? html : reviewRequestLayout(html);
    }

    if (template) {
        const text = reviewRequestEmailPlainText({ customerName, businessName, reviewLink, template, senderName });
        const href = escapeHtml(reviewLink);
        const escaped = escapeHtml(text).replace(/\n/g, "<br>");
        const body = href ? escaped.split(href).join(`<a href="${href}" style="color:#1a0dab;text-decoration:underline;word-break:break-all;">${href}</a>`) : escaped;
        return reviewRequestLayout(`<p style="margin:0;white-space:pre-wrap;">${body}</p>`);
    }

    const greeting = escapeHtml(firstName(customerName) || "there");
    const biz = escapeHtml(businessName);
    const sender = (senderName || "").trim();
    const senderEsc = escapeHtml(sender);
    const signoff = escapeHtml(sender || businessName);
    const href = escapeHtml(reviewLink);
    const linkText = escapeHtml(reviewLink);

    const intro = sender
        ? `This is ${senderEsc} from ${biz}.`
        : `Hope you had a good visit to ${biz}.`;

    return reviewRequestLayout(`
    <p style="margin:0 0 16px;">Hi ${greeting},</p>
    <p style="margin:0 0 16px;">${intro}</p>
    <p style="margin:0 0 16px;">If you have a minute, we&rsquo;d love to hear how it went:</p>
    <p style="margin:0 0 16px;"><a href="${href}" style="color:#1a0dab;text-decoration:underline;word-break:break-all;">${linkText}</a></p>
    <p style="margin:0 0 16px;color:#5f6368;">Thank you for sharing your honest feedback.</p>
    <p style="margin:0 0 4px;">Thanks,</p>
    <p style="margin:0;">${signoff}</p>
`);
}
