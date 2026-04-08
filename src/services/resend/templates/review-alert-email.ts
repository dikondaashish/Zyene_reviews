
interface ReviewAlertProps {
    businessName: string;
    rating: number;
    authorName: string;
    reviewText: string;
    urgencyScore: number;
    dashboardUrl: string;
    settingsUrl: string;
    customerEmail?: string;
}

export function reviewAlertEmail({
    businessName,
    rating,
    authorName,
    reviewText,
    urgencyScore,
    dashboardUrl,
    settingsUrl,
    customerEmail,
}: ReviewAlertProps): string {
    const starLabel = "★".repeat(rating) + "☆".repeat(5 - rating);
    const starColor = rating >= 4 ? "#16a34a" : rating === 3 ? "#ca8a04" : "#dc2626";

    const urgencyBadge = urgencyScore >= 7
        ? `<div style="margin-top: 12px; display: inline-block; background-color: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">High Priority Action Needed</div>`
        : "";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Review for ${businessName}</title>
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
                                    New Review Alert
                                </span>
                                ${urgencyBadge}
                            </div>

                            <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.025em;">
                                Fresh feedback for ${businessName}
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; color: #52525b;">
                                <strong>${authorName}</strong> just posted a new review on Google. Here's what they had to say:
                            </p>

                            <!-- Review Card -->
                            <div style="background-color: #fcfbfa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                                <div style="margin-bottom: 12px; font-size: 24px; color: ${starColor}; letter-spacing: 2px;">
                                    ${starLabel}
                                </div>
                                <div style="font-size: 16px; line-height: 1.6; color: #18181b; font-style: italic;">
                                    "${reviewText}"
                                </div>
                            </div>

                            <!-- CTA -->
                            <div style="margin-bottom: 40px; display: flex; gap: 12px; flex-wrap: wrap;">
                                <a href="${dashboardUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; border: 1px solid #27272a;">
                                    View in Dashboard
                                </a>
                                ${customerEmail ? `
                                <a href="mailto:${customerEmail}?subject=Regarding your recent feedback&body=Hi ${authorName !== customerEmail ? authorName : 'there'},%0D%0A%0D%0ATo help us look into this, could you share a bit more detail?%0D%0A%0D%0A" style="display: inline-block; background-color: #ffffff; color: #18181b; font-weight: 600; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; border: 1px solid #e4e4e7;">
                                    Reply to Customer
                                </a>
                                ` : ''}
                            </div>

                            <!-- Footer Section -->
                            <div style="padding-top: 32px; border-top: 1px solid #f4f4f5;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #71717a;">
                                    Tip: Replying within 24 hours can boost your ranking and customer trust.
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                                    <a href="${settingsUrl}" style="color: #71717a; text-decoration: underline;">Manage Notification Settings</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <div style="font-size: 12px; color: #a1a1aa;">
                                © ${new Date().getFullYear()} Zyene Inc. <br>
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
