export const STEPS = ["Basics", "Message", "Timing", "Review & Launch"];

export const DELAY_OPTIONS = [
    { value: 0, label: "Immediately" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 240, label: "4 hours" },
    { value: 1440, label: "1 day" },
];

export const REMINDER_DELAY_OPTIONS = [
    { value: 24, label: "1 day" },
    { value: 48, label: "2 days" },
    { value: 72, label: "3 days" },
    { value: 120, label: "5 days" },
    { value: 168, label: "7 days" },
    { value: 336, label: "14 days" },
];

export const DEFAULT_SMS =
    "Hi {customer_name}! Thanks for visiting {business_name}. We'd love your feedback - takes 30 seconds: {review_link}";
export const DEFAULT_EMAIL_SUBJECT = "How was your visit to {business_name}?";
export const DEFAULT_EMAIL_BODY = `<p>Hi {customer_name},</p>
<p>Thank you for visiting {business_name}! We'd really appreciate your feedback - it helps us improve and helps others discover us.</p>
<p><a href="{review_link}">Leave a Review</a></p>
<p>It only takes about 30 seconds. Thank you!</p>`;
export const DEFAULT_FOLLOW_UP =
    "Hi {customer_name}, just a friendly reminder - we'd love to hear about your experience at {business_name}: {review_link}";
