
interface SubscriptionCanceledEmailProps {
    userName: string;
    endDate: string;
    rejoinUrl: string;
}

export function subscriptionCanceledEmail({
    userName,
    endDate,
    rejoinUrl,
}: SubscriptionCanceledEmailProps): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Canceled - We're sorry to see you go</title>
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

                            <!-- Bye Icon -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="display: inline-block; width: 64px; height: 64px; background-color: #f4f4f5; border-radius: 50%; text-align: center; line-height: 64px;">
                                    <span style="font-size: 32px;">👋</span>
                                </div>
                            </div>

                             <!-- Heading -->
                             <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center; letter-spacing: -0.025em;">
                                 We're sad to see you go...
                             </h1>
                             <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b; text-align: center;">
                                 Hi ${userName}, we've loved having you as part of the Zyene Reviews community. This is to confirm your subscription will end on <strong>${endDate}</strong>.
                             </p>

                             <!-- Win-back Offer -->
                             <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 32px; margin-bottom: 40px; text-align: center;">
                                 <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #854d0e;">
                                     Wait! We'd love to have you back.
                                 </h3>
                                 <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5; color: #713f12;">
                                     If price was the issue, we'd like to help. Come back today and get <strong>25% off your next 3 months</strong> on any plan.
                                 </p>
                                 <a href="${rejoinUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                                     Reactivate with 25% Off
                                 </a>
                             </div>

                             <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; border: 1px solid #f1f5f9; text-align: center;">
                                 <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                                     <strong>How can we improve?</strong> We're always trying to build a better platform. If you have 30 seconds, we'd love to hear why you decided to leave — just reply to this email!
                                 </p>
                             </div>

                             <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                 <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #18181b;">
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
