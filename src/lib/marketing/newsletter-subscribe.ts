import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendEmail } from "@/services/resend/send-email";
import { newsletterConfirmEmail } from "@/services/resend/templates/newsletter-confirm-email";
import { recordNewsletterSourceEvent } from "@/lib/marketing/newsletter-source-events";
import {
    findSubscriberByEmail,
    insertPendingSubscriber,
    markConfirmationResent,
    resetSubscriberToPending,
    type SubscriberRow,
    type SubscriberSignup,
} from "@/lib/marketing/newsletter-subscriber-store";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A pending address gets at most one confirmation email per day, however often the form is sent. */
export const CONFIRMATION_RESEND_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type NewsletterSubscribeInput = {
    email: string;
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
};

export type NewsletterSubscribeResult =
    | { ok: true; newLead: boolean; message?: string }
    | { ok: false; error: string; status: number };

export function newsletterConfirmUrl(token: string): string {
    return `${marketingCanonicalUrl("/newsletter/confirm")}?token=${token}`;
}

async function sendConfirmationRequest(subscriber: SubscriberRow): Promise<void> {
    const { subject, html } = newsletterConfirmEmail({
        confirmUrl: newsletterConfirmUrl(subscriber.confirmation_token),
        source: subscriber.source,
    });
    const result = await sendEmail({
        stream: "forms",
        to: subscriber.email,
        subject,
        html,
        idempotencyKey: `newsletter-confirm/${subscriber.confirmation_token}/${subscriber.subscribed_at}`,
    });
    if (!result.sent) logger.error({ subscriberId: subscriber.id }, "[newsletter] confirmation email failed");
}

/** Which subscriber row (if any) should get a confirmation email for this sign-up. */
async function pendingSubscriberFor(signup: SubscriberSignup): Promise<{ row: SubscriberRow | null; newLead: boolean }> {
    const admin = createAdminClient();
    const existing = await findSubscriberByEmail(admin, signup.email);

    if (!existing) {
        const created = await insertPendingSubscriber(admin, signup);
        return { row: created, newLead: created !== null };
    }
    if (existing.unsubscribed_at) {
        return { row: await resetSubscriberToPending(admin, existing.id, signup), newLead: true };
    }
    if (existing.confirmed_at) return { row: null, newLead: false };

    const lastRequest = Date.parse(existing.subscribed_at);
    if (Date.now() - lastRequest < CONFIRMATION_RESEND_INTERVAL_MS) return { row: null, newLead: false };
    await markConfirmationResent(admin, existing.id);
    const refreshed = await findSubscriberByEmail(admin, signup.email);
    return { row: refreshed, newLead: false };
}

/**
 * Public-form sign-up (double opt-in). Creates or reopens a pending subscriber and
 * emails a confirmation link; nothing else is sent until the owner confirms.
 */
export async function processNewsletterSubscribe(body: NewsletterSubscribeInput): Promise<NewsletterSubscribeResult> {
    const email = body.email.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
        return { ok: false, error: "Valid email is required", status: 400 };
    }

    const signup: SubscriberSignup = {
        email,
        source: body.source ?? "newsletter",
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
    };

    let pending: { row: SubscriberRow | null; newLead: boolean };
    try {
        pending = await pendingSubscriberFor(signup);
    } catch (err) {
        logger.error({ err }, "[newsletter] subscribe failed");
        return { ok: false, error: "Could not subscribe", status: 500 };
    }

    await recordNewsletterSourceEvent(signup.source, "submit", signup);

    if (pending.row) {
        try {
            await sendConfirmationRequest(pending.row);
        } catch (err) {
            logger.error({ err }, "[newsletter] confirmation email failed");
        }
    }

    return { ok: true, newLead: pending.newLead };
}
