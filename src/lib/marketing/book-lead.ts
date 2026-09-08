import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { recordMarketingEvent } from "@/lib/marketing/record-marketing-event";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";
import { sendEmail } from "@/services/resend/send-email";
import { bookLeadEmail } from "@/services/resend/templates/book-lead-email";

export const BOOK_LEAD_SOURCE = "homepage_book_wizard";
export const BOOK_LEAD_PAGE_PATH = "/";
export const BOOK_DOWNLOAD_PATH = "/zyene-overview.pdf";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BookLeadInput = {
    email: string;
    industry?: string;
    goal?: string;
};

export type BookLeadResult =
    | { ok: true; downloadUrl: string; emailSent: boolean }
    | { ok: false; error: string };

export async function captureBookLead(input: BookLeadInput): Promise<BookLeadResult> {
    const email = input.email.trim().toLowerCase();
    const downloadUrl = BOOK_DOWNLOAD_PATH;
    if (!email || !EMAIL_RE.test(email)) {
        return { ok: false, error: "Valid email is required" };
    }

    try {
        const admin = createAdminClient();
        const { error } = await admin.from("marketing_subscribers").upsert(
            {
                email,
                source: BOOK_LEAD_SOURCE,
                utm_source: "homepage",
                utm_medium: "lead_magnet",
                utm_campaign: "book_wizard",
                subscribed_at: new Date().toISOString(),
                unsubscribed_at: null,
            },
            { onConflict: "email" }
        );

        if (error) {
            logger.error({ err: error }, "[book-lead] subscriber upsert failed");
            return { ok: false, error: "Could not save your email" };
        }

        await recordMarketingEvent({
            eventName: "homepage_book_lead",
            pagePath: BOOK_LEAD_PAGE_PATH,
            source: BOOK_LEAD_SOURCE,
            utmSource: "homepage",
            utmMedium: "lead_magnet",
            utmCampaign: "book_wizard",
            metadata: {
                industry: input.industry ?? "",
                goal: input.goal ?? "",
            },
        });

        let emailSent = false;
        if (process.env.NODE_ENV === "production") {
            try {
                const mail = bookLeadEmail({
                    downloadUrl: marketingCanonicalUrl(BOOK_DOWNLOAD_PATH),
                });
                const delivery = await sendEmail({ to: email, subject: mail.subject, html: mail.html });
                emailSent = delivery.sent === true;
            } catch (err) {
                logger.error({ err }, "[book-lead] delivery email failed");
            }
        }

        return { ok: true, downloadUrl, emailSent };
    } catch (err) {
        logger.error({ err }, "[book-lead] capture failed");
        return { ok: false, error: "Could not save your email" };
    }
}
