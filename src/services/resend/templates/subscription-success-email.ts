
interface SubscriptionSuccessEmailProps {
    userName: string;
    planName: string;
    isTrial: boolean;
    dashboardUrl: string;
}

export function subscriptionSuccessEmail({
    userName,
    planName,
    isTrial,
    dashboardUrl,
}: SubscriptionSuccessEmailProps): string {
    const title = isTrial 
        ? `Your ${planName} trial has started!` 
        : `Welcome to the ${planName} plan!`;
    
    const body = isTrial
        ? `We're excited to have you on board! Your 7-day free trial of the ${planName} plan is now active. You have full access to our smart features to help grow your business.`
        : `Your subscription to the ${planName} plan is now active. You have full access to all the premium features and higher limits of your new plan.`;

    const ctaText = isTrial ? "Explore your trial" : "Go to dashboard";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
                                    <span style="font-size: 32px;">✨</span>
                                </div>
                            </div>

                            <!-- Heading -->
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center; letter-spacing: -0.025em;">
                                ${title}
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b; text-align: center;">
                                Hi ${userName}, ${body}
                            </p>

                            <!-- CTA -->
                            <div style="text-align: center; margin-bottom: 48px;">
                                <a href="${dashboardUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 15px; border: 1px solid #27272a;">
                                    ${ctaText}
                                </a>
                            </div>

                            <!-- Features List -->
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; border: 1px solid #f1f5f9;">
                                <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">
                                    What's included in ${planName}:
                                </h2>
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td style="padding-bottom: 12px; vertical-align: top; width: 24px;">
                                            <span style="font-size: 16px; color: #10b981;">✓</span>
                                        </td>
                                        <td style="padding-bottom: 12px; padding-left: 12px; font-size: 14px; color: #3f3f46;">
                                            Smart Response Assistant (No limits)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 12px; vertical-align: top; width: 24px;">
                                            <span style="font-size: 16px; color: #10b981;">✓</span>
                                        </td>
                                        <td style="padding-bottom: 12px; padding-left: 12px; font-size: 14px; color: #3f3f46;">
                                            Higher review request limits (Email/SMS)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 12px; vertical-align: top; width: 24px;">
                                            <span style="font-size: 16px; color: #10b981;">✓</span>
                                        </td>
                                        <td style="padding-bottom: 12px; padding-left: 12px; font-size: 14px; color: #3f3f46;">
                                            Priority support and advanced insights
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                                    Need help? Feel free to reply to this email or visit our help center.
                                </p>
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #18181b;">
                                    The Zyene Reviews Team
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
                <div style="margin-top: 32px; text-align: center;">
                    <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                        © ${new Date().getFullYear()} Zyene Inc. All rights reserved.
                    </p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
