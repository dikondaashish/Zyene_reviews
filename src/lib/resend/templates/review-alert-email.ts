
interface ReviewAlertProps {
    businessName: string;
    rating: number;
    authorName: string;
    reviewText: string;
    urgencyScore: number;
    dashboardUrl: string;
    settingsUrl: string;
}

export function reviewAlertEmail({
    businessName,
    rating,
    authorName,
    reviewText,
    urgencyScore,
    dashboardUrl,
    settingsUrl,
}: ReviewAlertProps): string {
    const starColor = rating >= 4 ? "#16a34a" : rating === 3 ? "#ca8a04" : "#dc2626";
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const urgencyBadge = urgencyScore >= 7
        ? `<span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 8px;">High Urgency (${urgencyScore}/10)</span>`
        : "";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Review for ${businessName}</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #334155; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; margin-top: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 24px;">
            New Review for ${businessName}
        </h1>
        
        <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="color: ${starColor}; font-size: 24px; letter-spacing: 2px; margin-right: 8px;">${stars}</span>
                ${urgencyBadge}
            </div>
            <div style="font-weight: 600; color: #0f172a;">${authorName}</div>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin-bottom: 32px; font-style: italic; color: #475569;">
            "${reviewText}"
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
            <a href="${dashboardUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                Reply to this Review →
            </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

        <div style="font-size: 12px; color: #64748b; text-align: center;">
            You're receiving this because you have review alerts enabled.<br>
            <a href="${settingsUrl}" style="color: #64748b; text-decoration: underline;">Manage Notification Settings</a>
        </div>
    </div>
</body>
</html>
    `;
}
