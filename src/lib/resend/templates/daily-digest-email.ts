
interface ReviewDigestItem {
    rating: number;
    authorName: string;
    text: string;
    sentiment?: "positive" | "negative" | "neutral";
}

interface DailyDigestProps {
    businessName: string;
    reviews: ReviewDigestItem[];
    totalNew: number;
    avgRating: number;
    pendingCount: number;
    dashboardUrl: string;
    settingsUrl: string;
}

export function dailyDigestEmail({
    businessName,
    reviews,
    totalNew,
    avgRating,
    pendingCount,
    dashboardUrl,
    settingsUrl,
}: DailyDigestProps): string {
    const reviewRows = reviews.map(review => {
        const starColor = review.rating >= 4 ? "#16a34a" : review.rating === 3 ? "#ca8a04" : "#dc2626";
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        const snippet = review.text.length > 80 ? review.text.substring(0, 80) + "..." : review.text;

        return `
            <div style="border-bottom: 1px solid #e2e8f0; padding: 12px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: #334155; font-size: 14px;">${review.authorName}</span>
                    <span style="color: ${starColor}; font-size: 14px; letter-spacing: 1px;">${stars}</span>
                </div>
                <div style="font-size: 14px; color: #64748b;">${snippet}</div>
            </div>
        `;
    }).join("");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Digest for ${businessName}</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #334155; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; margin-top: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
            Daily Summary
        </h1>
        <p style="color: #64748b; margin-top: 0; margin-bottom: 24px;">for ${businessName}</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; background-color: #f8fafc; padding: 16px; border-radius: 8px;">
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${totalNew}</div>
                <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">New Reviews</div>
            </div>
            <div style="text-align: center; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${avgRating.toFixed(1)}</div>
                <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Avg Rating</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${pendingCount}</div>
                <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Pending</div>
            </div>
        </div>

        <div style="margin-bottom: 32px;">
            <div style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Latest Reviews</div>
            ${reviews.length > 0 ? reviewRows : '<div style="color: #64748b; font-style: italic; padding: 12px 0;">No new reviews today.</div>'}
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
            <a href="${dashboardUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                View Dashboard →
            </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

        <div style="font-size: 12px; color: #64748b; text-align: center;">
            <a href="${settingsUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe from Daily Digest</a>
        </div>
    </div>
</body>
</html>
    `;
}
