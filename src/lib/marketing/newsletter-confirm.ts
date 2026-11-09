import { z } from "zod";

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { scheduleMarketingNurture } from "@/lib/growth/schedule-growth-emails";
import { recordNewsletterSourceEvent } from "@/lib/marketing/newsletter-source-events";
import {
    confirmSubscriberByToken,
    findSubscriberByToken,
    type SubscriberRow,
} from "@/lib/marketing/newsletter-subscriber-store";
import { TEMPLATE_PACK_SOURCE } from "@/lib/marketing/template-pack-events";
import { isTemplatePackQaSubscriber } from "@/lib/marketing/template-pack-qa-filters";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";
import { sendEmail } from "@/services/resend/send-email";
import { newsletterWelcomeEmail } from "@/services/resend/templates/growth-marketing-emails";
import { reviewRequestTemplatePackEmail } from "@/services/resend/templates/review-request-templates-pack-email";

export type NewsletterConfirmResult = "confirmed" | "already_confirmed" | "invalid";

/** Sends what the person asked for and starts the nurture sequence, now that they confirmed. */
async function deliverConfirmedSignup(subscriber: SubscriberRow): Promise<void> {
    const unsubscribePage = `${marketingCanonicalUrl("/newsletter/unsubscribe")}?id=${subscriber.id}`;
    const mail =
        subscriber.source === TEMPLATE_PACK_SOURCE
            ? reviewRequestTemplatePackEmail({ unsubscribeUrl: unsubscribePage })
            : newsletterWelcomeEmail({ email: subscriber.email, unsubscribeUrl: unsubscribePage });
    try {
        await sendEmail({
            stream: "marketing",
            to: subscriber.email,
            subject: mail.subject,
            html: mail.html,
            unsubscribeUrl: `${marketingCanonicalUrl("/api/marketing/newsletter/unsubscribe")}?id=${subscriber.id}`,
            idempotencyKey: `newsletter-welcome/${subscriber.id}/${subscriber.confirmation_token}`,
        });
    } catch (err) {
        logger.error({ err, subscriberId: subscriber.id }, "[newsletter] welcome email failed");
    }

    await recordNewsletterSourceEvent(subscriber.source, "subscribe_success", subscriber);

    const isQa = isTemplatePackQaSubscriber(subscriber.email, subscriber.utm_source, subscriber.utm_medium);
    if (subscriber.source !== TEMPLATE_PACK_SOURCE && !isQa) {
        try {
            await scheduleMarketingNurture({ email: subscriber.email });
        } catch (err) {
            logger.error({ err, subscriberId: subscriber.id }, "[newsletter] marketing nurture schedule failed");
        }
    }
}

/**
 * Second half of double opt-in: the address owner pressed Confirm on the page
 * linked from the confirmation email. Throws only when the database is unavailable.
 */
export async function confirmNewsletterSubscription(rawToken: unknown): Promise<NewsletterConfirmResult> {
    const token = z.uuid().safeParse(rawToken);
    if (!token.success) return "invalid";

    const admin = createAdminClient();
    const confirmed = await confirmSubscriberByToken(admin, token.data);
    if (confirmed) {
        await deliverConfirmedSignup(confirmed);
        return "confirmed";
    }

    const existing = await findSubscriberByToken(admin, token.data);
    return existing?.confirmed_at && !existing.unsubscribed_at ? "already_confirmed" : "invalid";
}
