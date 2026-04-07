
interface PaymentFailedEmailProps {
    userName: string;
    amount: string;
    updateCardUrl: string;
}

export function paymentFailedEmail({
    userName,
    amount,
    updateCardUrl,
}: PaymentFailedEmailProps): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed - Action Required</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcfbfa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fcfbfa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e4e4e7;">
                    <tr>
                        <td style="padding: 32px 40px 48px;">
                            <!-- Logo Header -->
                            <div style="margin-bottom: 32px; text-align: center;">
                                <img src="https://zyenereviews.com/logo.png" alt="Zyene Reviews" width="160" style="display: block; margin: 0 auto; outline: none; border: none; text-decoration: none;">
                            </div>

                            <!-- Error Icon -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="display: inline-block; width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; text-align: center; line-height: 64px;">
                                    <span style="font-size: 32px;">⚠️</span>
                                </div>
                            </div>

                            <!-- Heading -->
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #991b1b; text-align: center; letter-spacing: -0.025em;">
                                Payment Failed
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b; text-align: center;">
                                Hi ${userName}, we were unable to process your recent payment of <strong>${amount}</strong>. To keep your account active and avoid any service interruptions, please update your payment method.
                            </p>

                            <!-- CTA -->
                            <div style="text-align: center; margin-bottom: 48px;">
                                <a href="${updateCardUrl}" style="display: inline-block; background-color: #b91c1c; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 15px; border: 1px solid #991b1b;">
                                    Update Payment Method
                                </a>
                            </div>

                            <div style="background-color: #fffbeb; border-radius: 8px; padding: 24px; border: 1px solid #fef3c7;">
                                <p style="margin: 0; font-size: 14px; color: #92400e; text-align: center; font-weight: 500;">
                                    Stripe will automatically retry your payment in a few days. Updating your card now ensures no downtime for your business.
                                </p>
                            </div>

                            <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                                    Need help with your billing? Feel free to contact us.
                                </p>
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #18181b;">
                                    The Zyene Reviews Team
                                </p>
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
