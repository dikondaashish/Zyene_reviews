interface ReviewRequestEmailProps {
    customerName: string;
    businessName: string;
    reviewLink: string;
    template?: string;
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Plain-text part — substantive copy helps Gmail treat mail as personal/transactional. */
export function reviewRequestEmailPlainText({
    customerName,
    businessName,
    reviewLink,
    template,
}: ReviewRequestEmailProps): string {
    const greeting = (customerName || "").trim() || "there";
    const rawBody =
        template ||
        `Thank you for choosing ${businessName}! We'd really appreciate your feedback — it helps us improve and helps others in our community discover our services.`;
    const body = rawBody
        .replace(/\{customer_name\}/g, customerName)
        .replace(/\{business_name\}/g, businessName)
        .replace(/\{review_link\}/g, reviewLink);
    return [
        `Hi ${greeting},`,
        "",
        body,
        "",
        `Leave feedback: ${reviewLink}`,
        "",
        `— ${businessName}`,
        "",
        `This message was sent by Zyene Reviews on behalf of ${businessName}.`,
        "If you were not a customer of this business, you can ignore this email.",
        "",
        "https://zyenereviews.com",
    ].join("\n");
}

/**
 * Default review-request HTML: simple, text-first layout (avoids nested “newsletter”
 * tables and remote hero images that often land in Gmail Promotions).
 */
export function reviewRequestEmail({
    customerName,
    businessName,
    reviewLink,
    template,
}: ReviewRequestEmailProps): string {
    if (template && template.includes("<") && template.includes(">")) {
        return template
            .replace(/\{customer_name\}/g, customerName)
            .replace(/\{business_name\}/g, businessName)
            .replace(/\{review_link\}/g, reviewLink);
    }

    const greeting = escapeHtml((customerName || "").trim() || "there");
    const biz = escapeHtml(businessName);
    const rawBody =
        template ||
        `Thank you for choosing {business_name}! We'd really appreciate your feedback — it helps us improve and helps others in our community discover our services.`;
    const formattedBody = escapeHtml(
        rawBody
            .replace(/\{customer_name\}/g, customerName)
            .replace(/\{business_name\}/g, businessName)
            .replace(/\{review_link\}/g, reviewLink),
    );

    const safeLink = escapeHtml(reviewLink);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Feedback for ${biz}</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#18181b;">
    <p style="margin:0 0 14px;">Hi ${greeting},</p>
    <p style="margin:0 0 20px;">${formattedBody.replace(/\n/g, "<br>")}</p>
    <p style="margin:0 0 10px;"><a href="${reviewLink}" style="color:#18181b;font-weight:600;">Open your short feedback form</a></p>
    <p style="margin:0 0 28px;font-size:13px;word-break:break-all;"><a href="${reviewLink}" style="color:#52525b;">${safeLink}</a></p>
    <p style="margin:0 0 6px;font-size:14px;color:#3f3f46;">Thank you,<br><strong>${biz}</strong></p>
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0;">
    <p style="margin:0;font-size:12px;line-height:1.5;color:#71717a;">
      Sent by <a href="https://zyenereviews.com" style="color:#52525b;text-decoration:underline;">Zyene Reviews</a>
      for <strong>${biz}</strong>. This is a one-to-one request about your visit, not a mailing list.
    </p>
  </div>
</body>
</html>`;
}
