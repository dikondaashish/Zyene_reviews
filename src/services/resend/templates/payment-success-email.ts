
interface PaymentSuccessEmailProps {
    userName: string;
    amount: string;
    date: string;
    invoiceUrl: string;
}

export function paymentSuccessEmail({
    userName,
    amount,
    date,
    invoiceUrl,
}: PaymentSuccessEmailProps): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - Zyene Reviews</title>
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

                            <!-- Success Icon -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="display: inline-block; width: 64px; height: 64px; background-color: #f0fdf4; border-radius: 50%; text-align: center; line-height: 64px;">
                                    <span style="font-size: 32px;">💰</span>
                                </div>
                            </div>

                            <!-- Heading -->
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center; letter-spacing: -0.025em;">
                                Payment Successful
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b; text-align: center;">
                                Hi ${userName}, we've successfully processed your payment of **${amount}** on ${date}. Thank you for your continued support!
                            </p>

                            <!-- CTA -->
                            <div style="text-align: center; margin-bottom: 48px;">
                                <a href="${invoiceUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 15px; border: 1px solid #27272a;">
                                    Download Invoice
                                </a>
                            </div>

                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; border: 1px solid #f1f5f9;">
                                <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
                                    Your subscription will continue to renew automatically. You can manage your billing preferences at any time in your dashboard settings.
                                </p>
                            </div>

                            <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
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
