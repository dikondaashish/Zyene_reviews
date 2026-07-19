/**
 * Optional MIME headers for review-request mail.
 *
 * We intentionally DO NOT set:
 *   - `Auto-Submitted: auto-generated` — Gmail treats this as a bulk/automation
 *     signal and pushes the mail into Promotions/Updates. Review requests are
 *     1:1 transactional, so we omit it to keep messages eligible for Primary.
 *   - `Precedence: bulk` — same reason.
 *   - `List-Unsubscribe` — Gmail’s bulk-only inbox category. We are not a list.
 *
 * Returning an empty object lets the call sites stay generic; the Resend SDK
 * skips the headers payload when it’s empty.
 *
 * Auth note: Resend DKIM is verified on zyenereviews.com. Root SPF currently
 * only includes Zoho; Return-Path SPF lives on send.zyenereviews.com (SES).
 * Prefer adding `include:amazonses.com` to the root SPF TXT if Zoho allows
 * multiple includes — belt-and-suspenders for DMARC.
 */
export const REVIEW_REQUEST_EMAIL_HEADERS: Record<string, string> = {};
