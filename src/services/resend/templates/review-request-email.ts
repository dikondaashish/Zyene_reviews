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

/** Safe for double-quoted HTML attributes (e.g. href). */
function escapeAttr(s: string): string {
    return escapeHtml(s).replace(/'/g, "&#39;");
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
        `Thanks for choosing ${businessName}. When you have a moment, a quick note about your visit would mean a lot to us.`;
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
 * Minimal HTML for one-to-one review requests: reads like a personal note in Gmail
 * (plain flow, single link, no “newsletter” chrome). Tab placement is still heuristic.
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
        `Thanks for choosing {business_name}. When you have a moment, a quick note about your visit would mean a lot to us.`;
    const formattedBody = escapeHtml(
        rawBody
            .replace(/\{customer_name\}/g, customerName)
            .replace(/\{business_name\}/g, businessName)
            .replace(/\{review_link\}/g, reviewLink),
    );

    const safeLink = escapeHtml(reviewLink);
    const href = escapeAttr(reviewLink);

    const font =
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif";
    const text = "#202124";
    const muted = "#5f6368";

    const bodyHtml = formattedBody.replace(/\n/g, "<br>");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td style="padding:28px 20px 40px;">
        <div style="max-width:560px;margin:0 auto;font-family:${font};font-size:16px;line-height:1.6;color:${text};">
          <p style="margin:0 0 16px;">Hi ${greeting},</p>
          <p style="margin:0 0 22px;">${bodyHtml}</p>
          <p style="margin:0 0 10px;">
            <a href="${href}" style="color:#1a0dab;text-decoration:underline;">Leave feedback</a>
            <span style="color:${muted};"> — about a minute.</span>
          </p>
          <p style="margin:0 0 28px;font-size:13px;line-height:1.5;color:${muted};word-break:break-all;">${safeLink}</p>
          <p style="margin:0 0 6px;">Thank you,</p>
          <p style="margin:0;"><strong>${biz}</strong></p>
          <p style="margin:28px 0 0;font-size:12px;line-height:1.55;color:${muted};">
            Sent by Zyene Reviews for ${biz}. One-to-one message about your visit, not a mailing list.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
