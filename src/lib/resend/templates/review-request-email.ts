
interface ReviewRequestEmailProps {
    customerName: string;
    businessName: string;
    reviewLink: string;
    template?: string; // HTML template with placeholders
}

export function reviewRequestEmail({
    customerName,
    businessName,
    reviewLink,
    template
}: ReviewRequestEmailProps): string {
    // If user provided a custom HTML template, use it and swap placeholders
    if (template && template.includes("<") && template.includes(">")) {
        return template
            .replace(/\{customer_name\}/g, customerName)
            .replace(/\{business_name\}/g, businessName)
            .replace(/\{review_link\}/g, reviewLink);
    }

    // Default template
    const body = template || `Thank you for visiting {business_name}! We'd really appreciate your feedback — it helps us improve and helps others discover us.`;
    const formattedBody = body
        .replace(/\{customer_name\}/g, customerName)
        .replace(/\{business_name\}/g, businessName)
        .replace(/\{review_link\}/g, reviewLink);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Feedback for ${businessName}</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #334155; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; margin-top: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 24px;">
            Hi ${customerName},
        </h1>
        
        <div style="color: #475569; margin-bottom: 32px; font-size: 16px;">
            ${formattedBody}
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
            <a href="${reviewLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                Leave a Review →
            </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; text-align: center;">
            It only takes about 30 seconds. Thank you!
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

        <div style="font-size: 12px; color: #94a3b8; text-align: center;">
            Sent on behalf of <strong>${businessName}</strong> using Zyene.
        </div>
    </div>
</body>
</html>
    `;
}
