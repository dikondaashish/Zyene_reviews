interface ReviewRequestEmailProps {
    customerName: string;
    businessName: string;
    reviewLink: string;
    template?: string;
    /** Optional first-person sender, e.g. "Sam". When provided we sign as this person. */
    senderName?: string;
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Safe for double-quoted HTML attributes (e.g. href). */
function escapeAttr(s: string): string {
    return escapeHtml(s).replace(/'/g, "&#39;");
}

function firstName(value: string | null | undefined): string {
    const cleaned = (value || "").trim().split(/\s+/)[0] || "";
    return cleaned;
}

/**
 * Plain-text body. Short, conversational, asks for a reply — patterns that
 * Gmail typically treats as personal correspondence rather than bulk mail.
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
        const rendered = template
            .replace(/\{customer_name\}/g, customerName || "")
            .replace(/\{business_name\}/g, businessName)
            .replace(/\{review_link\}/g, reviewLink)
            .replace(/\{sender_name\}/g, sender);
        return rendered;
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
        "Or just reply to this email — I read every response.",
        "",
        "Thanks,",
        signoff,
    ].join("\n");
}

/**
 * Minimal HTML for one-to-one review requests. Plain-text vibe, single link,
 * asks for a reply, no marketing chrome or UTM footers.
 */
export function reviewRequestEmail({
    customerName,
    businessName,
    reviewLink,
    template,
    senderName,
}: ReviewRequestEmailProps): string {
    if (template && template.includes("<") && template.includes(">")) {
        return template
            .replace(/\{customer_name\}/g, customerName || "")
            .replace(/\{business_name\}/g, businessName)
            .replace(/\{review_link\}/g, reviewLink)
            .replace(/\{sender_name\}/g, senderName || "");
    }

    const greeting = escapeHtml(firstName(customerName) || "there");
    const biz = escapeHtml(businessName);
    const sender = (senderName || "").trim();
    const senderEsc = escapeHtml(sender);
    const signoff = escapeHtml(sender || businessName);
    const href = escapeAttr(reviewLink);
    const linkText = escapeHtml(reviewLink);

    const intro = sender
        ? `This is ${senderEsc} from ${biz}.`
        : `Hope you had a good visit to ${biz}.`;

    const font =
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif";
    const text = "#202124";
    const muted = "#5f6368";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanks for stopping by</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:24px 20px 32px;font-family:${font};font-size:16px;line-height:1.6;color:${text};">
    <p style="margin:0 0 16px;">Hi ${greeting},</p>
    <p style="margin:0 0 16px;">${intro}</p>
    <p style="margin:0 0 16px;">If you have a minute, we&rsquo;d love to hear how it went:</p>
    <p style="margin:0 0 16px;"><a href="${href}" style="color:#1a0dab;text-decoration:underline;word-break:break-all;">${linkText}</a></p>
    <p style="margin:0 0 16px;color:${muted};">Or just reply to this email &mdash; I read every response.</p>
    <p style="margin:0 0 4px;">Thanks,</p>
    <p style="margin:0;">${signoff}</p>
  </div>
</body>
</html>`;
}
