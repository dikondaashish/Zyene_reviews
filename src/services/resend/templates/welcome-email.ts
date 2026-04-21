
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
    <title>Your Zyene Reviews account is ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcfbfa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fcfbfa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e4e4e7;">
                        <td style="padding: 32px 40px 48px;">
                            <!-- Header -->
                            <div style="margin-bottom: 32px; text-align: center;">
                                <img src="https://zyenereviews.com/logo.png" alt="Zyene Reviews" width="160" style="display: block; margin: 0 auto; outline: none; border: none; text-decoration: none;">
                            </div>

                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.025em;">
                                Hi ${userName},
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Your Zyene Reviews account is ready.
                            </p>

                            <div style="margin-bottom: 24px;">
                                <a href="${loginUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 15px; border: 1px solid #27272a;">
                                    Open dashboard
                                </a>
                            </div>

                            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #f4f4f5;">
                                <p style="margin: 0 0 10px; font-size: 15px; color: #52525b; line-height: 1.6;">
                                    Recommended next steps:
                                </p>
                                <ul style="margin: 0 0 14px; padding-left: 20px; color: #52525b; font-size: 15px; line-height: 1.6;">
                                    <li>Connect your Google Business Profile</li>
                                    <li>Check your first review insights</li>
                                    <li>Send your first review request</li>
                                </ul>
                                <p style="margin: 0; font-size: 15px; color: #52525b; line-height: 1.6;">
                                    Need help? Reply to this email and our team will assist you.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <div style="font-size: 12px; color: #a1a1aa;">
                                © ${new Date().getFullYear()} Zyene Reviews
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

export function welcomeEmailText({
    userName,
    loginUrl,
}: WelcomeEmailProps): string {
    return [
        `Hi ${userName},`,
        "",
        "Your Zyene Reviews account is ready.",
        "",
        "Open dashboard:",
        loginUrl,
        "",
        "Recommended next steps:",
        "- Connect your Google Business Profile",
        "- Check your first review insights",
        "- Send your first review request",
        "",
        "Need help? Reply to this email and our team will assist you.",
        "",
        `© ${new Date().getFullYear()} Zyene Reviews`,
    ].join("\n");
}
