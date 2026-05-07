/**
 * Signals for one-to-one review request mail (helps clients treat as transactional
 * rather than marketing). Gmail tab placement is still heuristic; SPF/DKIM/DMARC and
 * engagement also matter — see https://support.google.com/mail/answer/6579
 */
export const REVIEW_REQUEST_EMAIL_HEADERS: Record<string, string> = {
    /** RFC 2156 / Outlook-style importance (some clients show “important”) */
    Importance: "high",
    /** Legacy priority hint (1 = highest) */
    "X-Priority": "1",
    /** RFC 3834 — automated but recipient-specific message */
    "Auto-Submitted": "auto-generated",
};
