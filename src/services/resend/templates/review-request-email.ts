
interface ReviewRequestEmailProps {
    customerName: string;
    businessName: string;
    reviewLink: string;
    template?: string; // HTML template with placeholders
}

export function reviewRequestEmail({
    customerName,
    businessName,
    reviewLink,
    template
}: ReviewRequestEmailProps): string {
    // If user provided a custom HTML template, use it and swap placeholders
    if (template && template.includes("<") && template.includes(">")) {
        return template
            .replace(/\{customer_name\}/g, customerName)
            .replace(/\{business_name\}/g, businessName)
            .replace(/\{review_link\}/g, reviewLink);
    }

    // Default template content
    const body = template || `Thank you for choosing {business_name}! We'd really appreciate your feedback — it helps us improve and helps others in our community discover our services.`;
    const formattedBody = body
        .replace(/\{customer_name\}/g, customerName)
        .replace(/\{business_name\}/g, businessName)
        .replace(/\{review_link\}/g, reviewLink);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback for ${businessName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcfbfa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fcfbfa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e4e4e7;">
                        <td style="padding: 32px 40px 48px;">
                            <!-- Logo Header -->
                            <div style="margin-bottom: 32px; text-align: center;">
                                <img src="https://zyenereviews.com/logo.png" alt="Zyene Reviews" width="160" style="display: block; margin: 0 auto; outline: none; border: none; text-decoration: none;">
                            </div>
                            <!-- Header -->
                            <div style="margin-bottom: 24px;">
                                <span style="display: inline-block; background-color: #f4f4f5; color: #18181b; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Feedback Request
                                </span>
                            </div>

                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.025em;">
                                Hi ${customerName},
                            </h1>
                            
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                                ${formattedBody}
                            </p>

                            <!-- CTA -->
                            <div style="margin-bottom: 32px; text-align: center;">
                                <a href="${reviewLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 16px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; border: 1px solid #27272a;">
                                    Share your experience
                                </a>
                            </div>

                            <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
                                It only takes about 30 seconds. Your feedback means a lot to us!
                            </p>

                            <!-- Footer Section -->
                            <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                                    Sent on behalf of <strong>${businessName}</strong>. <br>
                                    Powered by <a href="#" style="color: #71717a; text-decoration: none;">Zyene Reviews</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <div style="font-size: 12px; color: #a1a1aa;">
                                © ${new Date().getFullYear()} Zyene Reviews Inc. <br>
                                <a href="#" style="color: #71717a; text-decoration: underline;">Unsubscribe</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
