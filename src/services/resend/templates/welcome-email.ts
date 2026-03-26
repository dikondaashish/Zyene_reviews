
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
    <title>Welcome to Zyene Ratings</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #334155; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; margin-top: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
            Welcome to Zyene, ${userName}!
        </h1>
        <p style="color: #475569; margin-bottom: 24px;">
            We're thrilled to have you onboard. Zyene helps you manage reviews, reply faster with AI, and grow your business.
        </p>
        
        <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
            <h3 style="margin-top: 0; font-size: 16px; color: #0f172a; margin-bottom: 16px;">Quick Start Guide</h3>
            
            <div style="margin-bottom: 16px; display: flex;">
                <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">1</div>
                <div>
                    <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Connect Google Business</div>
                    <div style="font-size: 14px; color: #64748b;">Link your profile to start syncing reviews instantly.</div>
                </div>
            </div>
            
            <div style="margin-bottom: 16px; display: flex;">
                 <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">2</div>
                 <div>
                    <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Enable Alerts</div>
                    <div style="font-size: 14px; color: #64748b;">Go to Settings > Notifications to set up SMS & Email alerts.</div>
                </div>
            </div>
            
            <div style="display: flex;">
                 <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">3</div>
                 <div>
                    <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Reply & Grow</div>
                    <div style="font-size: 14px; color: #64748b;">Use AI to reply to reviews and send review requests to get more 5-star ratings.</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                Go to Dashboard →
            </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">
            Have questions? Just reply to this email. We're here to help.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

        <div style="font-size: 12px; color: #94a3b8; text-align: center;">
            © ${new Date().getFullYear()} Zyene Inc.
        </div>
    </div>
</body>
</html>
    `;
}
