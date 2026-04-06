
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
        const snippet = review.text.length > 100 ? review.text.substring(0, 100) + "..." : review.text;

        return `
            <div style="border-bottom: 1px solid #f4f4f5; padding: 16px 0;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="font-size: 15px; font-weight: 600; color: #18181b;">${review.authorName}</td>
                        <td align="right" style="font-size: 14px; color: ${starColor}; letter-spacing: 1px;">${stars}</td>
                    </tr>
                </table>
                <p style="margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: #52525b; font-style: italic;">"${snippet}"</p>
            </div>
        `;
    }).join("");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Digest - ${businessName}</title>
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
                            <div style="margin-bottom: 24px;">
                                <span style="display: inline-block; background-color: #f4f4f5; color: #18181b; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Daily Digest
                                </span>
                            </div>

                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.025em;">
                                Your Daily Summary
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; color: #52525b;">
                                for ${businessName}
                            </p>

                            <!-- Metric Grid (Table-based for email support) -->
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fcfbfa; border: 1px solid #f4f4f5; border-radius: 8px; margin-bottom: 32px;">
                                <tr>
                                    <td align="center" style="padding: 20px; border-right: 1px solid #f4f4f5;">
                                        <div style="font-size: 24px; font-weight: 700; color: #18181b;">${totalNew}</div>
                                        <div style="font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; margin-top: 4px;">New</div>
                                    </td>
                                    <td align="center" style="padding: 20px; border-right: 1px solid #f4f4f5;">
                                        <div style="font-size: 24px; font-weight: 700; color: #18181b;">${avgRating.toFixed(1)}</div>
                                        <div style="font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; margin-top: 4px;">Rating</div>
                                    </td>
                                    <td align="center" style="padding: 20px;">
                                        <div style="font-size: 24px; font-weight: 700; color: ${pendingCount > 0 ? '#dc2626' : '#18181b'};">${pendingCount}</div>
                                        <div style="font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; margin-top: 4px;">Pending</div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Latest Reviews -->
                            <div style="margin-bottom: 32px;">
                                <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Latest Reviews
                                </h3>
                                ${reviews.length > 0 ? reviewRows : '<p style="color: #a1a1aa; font-style: italic; font-size: 14px;">No new reviews today.</p>'}
                            </div>

                            <!-- CTA -->
                            <div style="margin-bottom: 40px; text-align: center;">
                                <a href="${dashboardUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; border: 1px solid #27272a;">
                                    View Full Dashboard
                                </a>
                            </div>

                            <!-- Footer Section -->
                            <div style="padding-top: 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                                    Tip: Constant engagement with your recent reviews improves SEO visibility.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <div style="font-size: 12px; color: #a1a1aa;">
                                © ${new Date().getFullYear()} Zyene Reviews Inc. <br>
                                <a href="${settingsUrl}" style="color: #71717a; text-decoration: underline;">Manage Notification Settings</a>
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
