import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { competitorAlertEmail } from "@/services/resend/templates/competitor-alert-email";
import { sendEmail } from "@/services/resend/send-email";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.zyenereviews.com").replace(/\/$/, "");

export type CompetitorAlertEmailPayload = {
    businessId: string;
    title: string;
    summary: string;
    eventType: string;
};

/**
 * Sends competitor threshold alert emails to org members who have email enabled
 * (notification_preferences), mirroring review-alert behavior.
 */
export async function sendCompetitorAlertEmail(payload: CompetitorAlertEmailPayload): Promise<void> {
    const admin = createAdminClient();

    const { data: business } = await admin
        .from("businesses")
        .select("organization_id, name")
        .eq("id", payload.businessId)
        .maybeSingle();

    if (!business?.organization_id) {
        logger.error({ err: payload.businessId }, "[competitor-alert-email] Business not found:");
        return;
    }

    const { data: members, error: membersErr } = await admin
        .from("organization_members")
        .select(
            `
            user_id,
            users (
                email
            )
        `
        )
        .eq("organization_id", business.organization_id)
        .eq("status", "active");

    if (membersErr || !members?.length) {
        logger.error({ err: membersErr }, "[competitor-alert-email] No members:");
        return;
    }

    const userIds = members.map((m) => m.user_id);
    const { data: prefs } = await admin
        .from("notification_preferences")
        .select("user_id, email_enabled")
        .in("user_id", userIds)
        .eq("business_id", payload.businessId);

    const businessName = business.name || "Your business";
    const html = competitorAlertEmail({
        businessName, title: payload.title, summary: payload.summary,
        dashboardUrl: `${APP_URL}/competitors`, settingsUrl: `${APP_URL}/settings/competitor-alerts`,
    });

    await Promise.all(
        members.map(async (member) => {
            const email = (member.users as { email?: string } | null)?.email;
            if (!email) return;
            const pref = prefs?.find((p) => p.user_id === member.user_id);
            const emailEnabled = pref ? pref.email_enabled !== false : true;
            if (!emailEnabled) return;

            await sendEmail({
                to: email,
                subject: `[${businessName}] ${payload.title}`,
                html,
                text: `${payload.title}\n\n${payload.summary}\n\n${APP_URL}/competitors`,
            });
        })
    );
}
