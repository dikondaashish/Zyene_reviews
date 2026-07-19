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
 * Auth note: review-request mail uses the CollectRatings Resend account
 * (`RESEND_COLLECTRATINGS_API_KEY`, From on `send.collectratings.com`) so the
 * From domain aligns with capture links on `collectratings.com`. Other product
 * mail stays on the Zyene Resend account (`RESEND_API_KEY` / zyenereviews.com).
 */
export const REVIEW_REQUEST_EMAIL_HEADERS: Record<string, string> = {};
