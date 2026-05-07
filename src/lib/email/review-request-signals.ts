/**
 * Optional MIME headers for review-request mail. Gmail’s Primary vs Promotions
 * placement is mostly ML-driven; flashy HTML and bulk-style headers correlate
 * with Promotions — keep this minimal. SPF/DKIM/DMARC and recipient engagement
 * still dominate — see https://support.google.com/mail/answer/6579
 */
export const REVIEW_REQUEST_EMAIL_HEADERS: Record<string, string> = {
    /** RFC 3834 — automated, recipient-specific (avoid “marketing” priority headers). */
    "Auto-Submitted": "auto-generated",
};
