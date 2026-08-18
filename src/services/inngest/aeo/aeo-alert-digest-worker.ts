import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { isLiveAlertingEnabled } from "@/lib/features/aeo-surfaces";
import { SupabaseAlertStore } from "@/services/aeo/alerting/alert-store";
import { aeoAlertDigestEmail, type AeoAlertDigestItem } from "@/services/resend/templates/aeo-alert-digest-email";
import { sendEmail } from "@/services/resend/send-email";

/** F8's "alert storm" edge case: cap what goes IN the email, link to the rest. */
const MAX_ALERTS_PER_EMAIL = 10;

export const aeoAlertDigestWorker = inngest.createFunction(
    { id: "aeo-alert-digest-worker", concurrency: { key: "event.data.businessId", limit: 1 } },
    { event: "cron/aeo-alert-digest.business" },
    async ({ event, step }) => {
        if (!isLiveAlertingEnabled()) {
            return { skipped: "live_alerting_disabled" as const };
        }

        const { businessId } = event.data;
        const admin = createAdminClient();
        const store = new SupabaseAlertStore(admin);

        const digest = await step.run("build-digest", async () => {
            const alerts = await store.loadUndigested(businessId);
            if (alerts.length === 0) return null;

            const { data: business } = await admin
                .from("businesses")
                .select("id, name, organization_id")
                .eq("id", businessId)
                .single();
            if (!business) return null;

            const { data: members } = await admin
                .from("organization_members")
                .select("user_id")
                .eq("organization_id", business.organization_id);
            if (!members || members.length === 0) return null;

            const { data: prefs } = await admin
                .from("notification_preferences")
                .select("*, users(email)")
                .eq("business_id", businessId)
                .in("user_id", members.map((m) => m.user_id));

            const recipients = (prefs ?? [])
                .map((p) => p as { user_id: string; digest_enabled?: boolean; users: { email?: string } | null })
                .filter((p) => p.digest_enabled !== false && p.users?.email)
                .map((p) => ({ userId: p.user_id, email: p.users?.email as string }))
                .sort((a, b) => a.userId.localeCompare(b.userId));

            if (recipients.length === 0) return null;

            const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.zyenereviews.com").replace(/\/$/, "");
            const items: AeoAlertDigestItem[] = alerts.slice(0, MAX_ALERTS_PER_EMAIL).map((a) => ({
                severity: a.severity as AeoAlertDigestItem["severity"],
                title: a.title,
                detail: a.detail,
                evidenceUrl: alertEvidenceUrl(appUrl, a),
            }));

            const emailHtml = aeoAlertDigestEmail({
                businessName: business.name ?? "your business",
                alerts: items,
                totalCount: alerts.length,
                dashboardUrl: `${appUrl}/google-seo-aeo/alerts`,
                settingsUrl: `${appUrl}/settings/notifications`,
            });

            return {
                businessName: business.name,
                recipients,
                emailHtml,
                alertIds: alerts.map((a) => a.id),
            };
        });

        if (!digest) return { sent: false };

        for (const recipient of digest.recipients) {
            await step.run(`send-digest-${recipient.userId}`, () =>
                sendEmail({
                    to: recipient.email,
                    subject: `AEO alerts for ${digest.businessName}`,
                    html: digest.emailHtml,
                })
            );
        }

        // Marked sent only after every recipient's step above has run —
        // a retry that reaches this point re-sends to nobody (steps are
        // memoized) and then correctly marks the batch delivered.
        await step.run("mark-digest-sent", () => store.markDigestSent(digest.alertIds));

        return { sent: true, alertCount: digest.alertIds.length, recipientCount: digest.recipients.length };
    }
);

function alertEvidenceUrl(
    appUrl: string,
    alert: { id: string; alert_type: string; prompt_id: string | null; engine_id: string | null }
): string {
    if (alert.prompt_id) {
        const engine = alert.engine_id ? `#engine-${encodeURIComponent(alert.engine_id)}` : "#evidence";
        return `${appUrl}/google-seo-aeo/prompts/${alert.prompt_id}${engine}`;
    }
    if (alert.alert_type === "technical_blocker") return `${appUrl}/google-seo-aeo/audit`;
    if (alert.alert_type === "rank_drop") return `${appUrl}/google-seo-aeo/geo-grid`;
    return `${appUrl}/google-seo-aeo/alerts#alert-${alert.id}`;
}
