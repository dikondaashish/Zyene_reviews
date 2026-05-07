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
 * Review-request HTML: table layout + inline styles for Gmail/Outlook;
 * single primary CTA, no remote images (keeps a transactional feel).
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
    const href = escapeAttr(reviewLink);

    const fontStack =
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif";
    const bgPage = "#f0eeea";
    const bgCard = "#fffefb";
    const borderSubtle = "#e8e4dc";
    const textMain = "#120909";
    const textMuted = "#6d685d";
    const primary = "#ff4f00";
    const onPrimary = "#ffffff";

    const bodyHtml = formattedBody.replace(/\n/g, "<br>");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>How was your visit to ${biz}?</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${bgPage};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Quick feedback for ${biz} — one short step. &#8204;&nbsp;&#8204;&nbsp;
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${bgPage};">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 20px;text-align:center;font-family:${fontStack};font-size:13px;font-weight:600;letter-spacing:0.04em;color:${textMuted};text-transform:uppercase;">
              Zyene Reviews
            </td>
          </tr>
          <tr>
            <td style="background-color:${bgCard};border:1px solid ${borderSubtle};border-radius:12px;box-shadow:0 1px 2px rgba(18,9,9,0.04);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:32px 28px 28px;font-family:${fontStack};color:${textMain};">
                    <p style="margin:0 0 8px;font-size:20px;font-weight:700;line-height:1.3;color:${textMain};">
                      How was your visit?
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:${textMuted};">
                      ${biz} would love to hear from you.
                    </p>
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${textMain};">
                      Hi ${greeting},
                    </p>
                    <p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:${textMain};">
                      ${bodyHtml}
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
                      <tr>
                        <td align="left" bgcolor="${primary}" style="background-color:${primary};border-radius:10px;">
                          <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-family:${fontStack};font-size:16px;font-weight:600;line-height:1.25;color:${onPrimary};text-decoration:none;border-radius:10px;">
                            Leave feedback
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${textMuted};">
                      Or copy this link into your browser:
                    </p>
                    <p style="margin:0 0 28px;font-size:12px;line-height:1.5;word-break:break-all;">
                      <a href="${href}" target="_blank" rel="noopener noreferrer" style="color:${primary};text-decoration:underline;">${safeLink}</a>
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.55;color:${textMain};">
                      Thank you,<br>
                      <strong style="font-weight:600;">${biz}</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 28px 28px;border-top:1px solid ${borderSubtle};font-family:${fontStack};font-size:12px;line-height:1.6;color:${textMuted};">
                    Sent by <a href="https://zyenereviews.com" target="_blank" rel="noopener noreferrer" style="color:${textMuted};text-decoration:underline;font-weight:500;">Zyene Reviews</a> for <strong style="color:${textMain};font-weight:600;">${biz}</strong>.
                    This is a one-to-one message about your visit, not a mailing list.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
