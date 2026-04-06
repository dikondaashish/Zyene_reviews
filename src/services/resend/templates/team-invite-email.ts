
export const TeamInviteEmail = (inviteLink: string, inviterName: string, organizationName: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation - Zyene Reviews</title>
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
                            <div style="margin-bottom: 32px;">
                                <span style="display: inline-block; background-color: #f4f4f5; color: #18181b; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Team Invitation
                                </span>
                            </div>

                                Join ${organizationName} on Zyene Reviews
                            
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                <strong>${inviterName}</strong> has invited you to join their team on <strong>Zyene Reviews</strong>.
                            </p>

                             <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Accept the invitation to start managing reviews, using our response assistant, and growing the business together.
                            </p>

                            <!-- CTA -->
                            <div style="margin-bottom: 40px;">
                                <a href="${inviteLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; border: 1px solid #27272a;">
                                    Accept Invitation
                                </a>
                            </div>

                            <!-- Footer Section -->
                            <div style="padding-top: 32px; border-top: 1px solid #f4f4f5;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #71717a;">
                                    If the button above doesn't work, copy and paste this link into your browser:
                                </p>
                                <p style="margin: 0; font-size: 14px; word-break: break-all;">
                                    <a href="${inviteLink}" style="color: #2563eb; text-decoration: none;">${inviteLink}</a>
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
