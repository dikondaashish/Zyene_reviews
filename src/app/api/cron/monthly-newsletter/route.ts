export const dynamic = "force-dynamic";

import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendEmail } from "@/services/resend/send-email";
import { monthlyNewsletterEmail } from "@/services/resend/templates/growth-emails";
import { getMonthlyNewsletterEdition } from "@/lib/phase6/monthly-newsletter-content";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";

const SITE_ORIGIN = "https://zyenereviews.com";

/**
 * Monthly marketing newsletter to blog/partners subscribers.
 * Schedule: 1st of each month, 10:00 — GET with Authorization: Bearer CRON_SECRET
 * (e.g. cron-jobs.org: "0 10 1 * *")
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const admin = createAdminClient();
    const { data: subscribers, error } = await admin
        .from("marketing_subscribers")
        .select("id, email")
        .is("unsubscribed_at", null);

    if (error) {
        logger.error({ err: error }, "[cron/monthly-newsletter] fetch failed:");
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscribers?.length) {
        return NextResponse.json({ message: "No active subscribers", sent: 0 });
    }

    const edition = getMonthlyNewsletterEdition();
    const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const caseStudyLink = `${SITE_ORIGIN}/case-studies/${edition.caseStudySlug}`;

    const sendResults = await Promise.all(
        subscribers.map(async (sub) => {
            const unsubscribeUrl = `${SITE_ORIGIN}/newsletter/unsubscribe?id=${sub.id}`;
            const { subject, html } = monthlyNewsletterEmail({
                monthLabel,
                productUpdate: edition.productUpdate,
                tipTitle: edition.tipTitle,
                tipBody: edition.tipBody,
                caseStudyLink,
                caseStudyTitle: edition.caseStudyTitle,
                unsubscribeUrl,
            });

            try {
                await sendEmail({ to: sub.email, subject, html });
                return "sent" as const;
            } catch (err) {
                logger.error({ err: err }, `[cron/monthly-newsletter] failed for ${sub.email}:`);
                return "failed" as const;
            }
        })
    );
    const sent = sendResults.filter((r) => r === "sent").length;
    const failed = sendResults.filter((r) => r === "failed").length;

    return NextResponse.json({
        success: true,
        sent,
        failed,
        total: subscribers.length,
        monthLabel,
    });
}
