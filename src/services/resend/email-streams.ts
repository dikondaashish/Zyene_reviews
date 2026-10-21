/**
 * Zyene-side email streams. Each kind of mail has its own sender so recipients can tell
 * them apart and each can be tuned (or moved to its own domain) independently.
 * Mail to a business's customers does not use these: see `send-review-request-email.ts`.
 *
 *   notifications → product alerts, digests, invites       (RESEND_FROM)
 *   account       → welcome and account/security mail       (RESEND_ACCOUNT_FROM)
 *   billing       → Stripe receipts and subscription mail   (RESEND_BILLING_FROM)
 *   marketing     → nurture, newsletter, free-tool results  (RESEND_MARKETING_FROM)
 *   forms         → website form receipts and lead notices  (RESEND_FORMS_FROM)
 */
export type EmailStream = "notifications" | "account" | "billing" | "marketing" | "forms";

const STREAMS: Record<EmailStream, { env: string; fallback: string }> = {
    notifications: { env: "RESEND_FROM", fallback: "Zyene Reviews <notifications@zyenereviews.com>" },
    account: { env: "RESEND_ACCOUNT_FROM", fallback: "Zyene Reviews <account@zyenereviews.com>" },
    billing: { env: "RESEND_BILLING_FROM", fallback: "Zyene Reviews Billing <billing@zyenereviews.com>" },
    marketing: { env: "RESEND_MARKETING_FROM", fallback: "Ashish from Zyene <ashish@zyenereviews.com>" },
    forms: { env: "RESEND_FORMS_FROM", fallback: "Zyene Forms <forms@zyenereviews.com>" },
};

/** From line for a stream: its env override, else the built-in address. */
export function streamFrom(stream: EmailStream = "notifications"): string {
    const { env, fallback } = STREAMS[stream];
    return process.env[env]?.trim() || fallback;
}
