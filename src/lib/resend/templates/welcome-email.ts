
interface WelcomeEmailProps {
    userName: string;
    loginUrl: string;
}

export function welcomeEmail({
    userName,
    loginUrl,
}: WelcomeEmailProps): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Zyene Reviews</title>
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

                            <!-- Greeting -->
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.025em;">
                                Welcome to the team, ${userName}
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                We're on a mission to help 99% of businesses grow through authentic customer feedback. Imagine a future where you never miss a review. Now you're part of that future.
                            </p>

                            <!-- CTA -->
                            <div style="margin-bottom: 48px;">
                                <a href="${loginUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 15px; border: 1px solid #27272a;">
                                    Get started for free
                                </a>
                            </div>

                            <!-- List Section -->
                            <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 600; color: #18181b;">
                                Meet Zyene Reviews: Your Personal Review Partner
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Zyene Reviews is your smart partner for turning customer feedback into growth—faster than you ever thought possible.
                            </p>

                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="padding-bottom: 20px; vertical-align: top; width: 32px;">
                                        <span style="font-size: 20px;">🎨</span>
                                    </td>
                                    <td style="padding-bottom: 20px; padding-left: 12px;">
                                        <strong style="display: block; color: #18181b; margin-bottom: 4px;">Connect and Sync</strong>
                                        <span style="font-size: 15px; color: #52525b; line-height: 1.5;">Link your Google Business profile to start syncing reviews instantly. We handle the setup.</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 20px; vertical-align: top; width: 32px;">
                                        <span style="font-size: 20px;">💬</span>
                                    </td>
                                    <td style="padding-bottom: 20px; padding-left: 12px;">
                                        <strong style="display: block; color: #18181b; margin-bottom: 4px;">Smart Response Assistant</strong>
                                        <span style="font-size: 15px; color: #52525b; line-height: 1.5;">Think of Zyene Reviews as your 24/7 support team. From simple thank-yous to complex feedback, we've got you covered.</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 20px; vertical-align: top; width: 32px;">
                                        <span style="font-size: 20px;">🚀</span>
                                    </td>
                                    <td style="padding-bottom: 20px; padding-left: 12px;">
                                        <strong style="display: block; color: #18181b; margin-bottom: 4px;">Ship Review Requests</strong>
                                        <span style="font-size: 15px; color: #52525b; line-height: 1.5;">When you're ready to grow, send review requests live instantly. No complicated setup. Just build and ship.</span>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #f4f4f5;">
                                <p style="margin: 0 0 16px; font-size: 16px; color: #52525b;">
                                    We're excited to see your business grow. If you ever have questions, our community is here to help.
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #18181b;">
                                    Let's prove it's possible,
                                </p>
                                <p style="margin: 4px 0 0; font-size: 16px; color: #71717a;">
                                    The Zyene Reviews Team 🚀
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
