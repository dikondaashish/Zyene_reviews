
interface RecoveryEmailProps {
    businessName: string;
    customerName?: string;
}

export function recoveryEmailTemplate({
    businessName,
    customerName,
}: RecoveryEmailProps): string {
    const greeting = customerName ? `Hi ${customerName},` : "Hi components,";
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We're Sorry - ${businessName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcfbfa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fcfbfa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e4e4e7;">
                    <tr>
                        <td style="padding: 32px 40px 48px;">
                            <!-- Header -->
                            <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.025em;">
                                We're sorry we missed the mark
                            </h1>
                            
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                ${greeting}
                            </p>

                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Thank you for sharing your feedback about your recent experience at <strong>${businessName}</strong>. 
                                We're truly sorry that we didn't meet your expectations this time.
                            </p>

                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Your feedback has been shared directly with our management team. We take all feedback seriously and are using yours to improve our service immediately.
                            </p>

                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                A member of our team may reach out to you shortly to discuss this further if you've provided your contact information.
                            </p>

                            <div style="padding-top: 32px; border-top: 1px solid #f4f4f5;">
                                <p style="margin: 0; font-size: 14px; color: #71717a;">
                                    Best regards,<br>
                                    Management at ${businessName}
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <div style="font-size: 12px; color: #a1a1aa;">
                                Sent via <a href="https://zyenereviews.com" style="color: #18181b; text-decoration: none; font-weight: 600;">Zyene Reviews</a>
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
