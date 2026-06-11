import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendEmail } from "@/services/resend/send-email";
import { newsletterWelcomeEmail } from "@/services/resend/templates/growth-emails";
import { reviewRequestTemplatePackEmail } from "@/services/resend/templates/review-request-templates-pack-email";
import { recordMarketingEvent } from "@/lib/marketing/record-marketing-event";
import {
    LOCAL_SEO_CHECKLIST_PAGE_PATH,
    LOCAL_SEO_CHECKLIST_SOURCE,
} from "@/lib/marketing/local-seo-checklist-events";
import { TEMPLATE_PACK_PAGE_PATH, TEMPLATE_PACK_SOURCE } from "@/lib/marketing/template-pack-events";
import { isTemplatePackQaSubscriber } from "@/lib/marketing/template-pack-qa-filters";
import { scheduleMarketingNurture } from "@/lib/growth/schedule-growth-emails";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

async function trackTemplatePack(
    body: NewsletterSubscribeInput,
    eventName: "template_pack_submit" | "template_pack_subscribe_success"
) {
    await recordMarketingEvent({
        eventName,
        pagePath: TEMPLATE_PACK_PAGE_PATH,
        source: TEMPLATE_PACK_SOURCE,
        utmSource: body.utm_source ?? null,
        utmMedium: body.utm_medium ?? null,
        utmCampaign: body.utm_campaign ?? null,
    });
}

async function trackLocalSeoChecklist(
    body: NewsletterSubscribeInput,
    eventName: "local_seo_checklist_submit" | "local_seo_checklist_subscribe_success"
) {
    await recordMarketingEvent({
        eventName,
        pagePath: LOCAL_SEO_CHECKLIST_PAGE_PATH,
        source: LOCAL_SEO_CHECKLIST_SOURCE,
        utmSource: body.utm_source ?? null,
        utmMedium: body.utm_medium ?? null,
        utmCampaign: body.utm_campaign ?? null,
    });
}

export async function processNewsletterSubscribe(
    body: NewsletterSubscribeInput
): Promise<NewsletterSubscribeResult> {
    const email = body.email.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
        return { ok: false, error: "Valid email is required", status: 400 };
    }

    const source = body.source ?? "newsletter";
    const isTemplatePack = source === TEMPLATE_PACK_SOURCE;
    const isLocalSeoChecklist = source === LOCAL_SEO_CHECKLIST_SOURCE;
    let newLead = false;
    const admin = createAdminClient();

    const { data: existing } = await admin
        .from("marketing_subscribers")
        .select("id, unsubscribed_at")
        .eq("email", email)
        .maybeSingle();

    if (existing?.unsubscribed_at) {
        const { error: reactivateErr } = await admin
            .from("marketing_subscribers")
            .update({
                unsubscribed_at: null,
                subscribed_at: new Date().toISOString(),
                source,
                utm_source: body.utm_source ?? null,
                utm_medium: body.utm_medium ?? null,
                utm_campaign: body.utm_campaign ?? null,
            })
            .eq("id", existing.id);

        if (reactivateErr) {
            logger.error({ err: reactivateErr }, "[newsletter] reactivate failed:");
            return { ok: false, error: "Could not subscribe", status: 500 };
        }
        newLead = true;
    } else if (!existing) {
        const { error: insertErr } = await admin.from("marketing_subscribers").insert({
            email,
            source,
            utm_source: body.utm_source ?? null,
            utm_medium: body.utm_medium ?? null,
            utm_campaign: body.utm_campaign ?? null,
        });

        if (insertErr?.code === "23505") {
            if (isTemplatePack) await trackTemplatePack(body, "template_pack_submit");
            if (isLocalSeoChecklist) await trackLocalSeoChecklist(body, "local_seo_checklist_submit");
            return { ok: true, newLead: false, message: "Already subscribed" };
        }
        if (insertErr) {
            logger.error({ err: insertErr }, "[newsletter] insert failed:");
            return { ok: false, error: "Could not subscribe", status: 500 };
        }
        newLead = true;
    }

    if (isTemplatePack) {
        await trackTemplatePack(body, "template_pack_submit");
        if (newLead) await trackTemplatePack(body, "template_pack_subscribe_success");
    }

    if (isLocalSeoChecklist) {
        await trackLocalSeoChecklist(body, "local_seo_checklist_submit");
        if (newLead) await trackLocalSeoChecklist(body, "local_seo_checklist_subscribe_success");
    }

    if (newLead) {
        const { data: subscriber } = await admin
            .from("marketing_subscribers")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        try {
            const unsubscribeUrl = subscriber?.id
                ? `${marketingCanonicalUrl("/newsletter/unsubscribe")}?id=${subscriber.id}`
                : marketingCanonicalUrl("/newsletter/unsubscribe");
            const mail =
                source === TEMPLATE_PACK_SOURCE
                    ? reviewRequestTemplatePackEmail({ unsubscribeUrl })
                    : newsletterWelcomeEmail({ email, unsubscribeUrl });
            await sendEmail({ to: email, subject: mail.subject, html: mail.html });
        } catch (err) {
            logger.error({ err }, "[newsletter] welcome email failed:");
        }

        const isQa = isTemplatePackQaSubscriber(
            email,
            body.utm_source ?? null,
            body.utm_medium ?? null
        );
        if (!isTemplatePack && !isQa) {
            try {
                await scheduleMarketingNurture({ email });
            } catch (err) {
                logger.error({ err }, "[newsletter] marketing nurture schedule failed:");
            }
        }
    }

    return { ok: true, newLead };
}
