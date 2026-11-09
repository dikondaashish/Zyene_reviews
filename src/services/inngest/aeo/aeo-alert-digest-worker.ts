import { NonRetriableError } from "inngest";
import { inngest } from "@/services/inngest/client";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { isLiveAlertingEnabled } from "@/lib/features/aeo-surfaces";
import { SupabaseAlertStore } from "@/services/aeo/alerting/alert-store";
import { aeoAlertDigestEmail, type AeoAlertDigestItem } from "@/services/resend/templates/aeo-alert-digest-email";
import { sendEmail } from "@/services/resend/send-email";
import { userCanAccessBusinessOrThrow } from "@/lib/db/supabase/verify-business-access-strict";
import { deliverAlertChannel } from "@/services/aeo/alerting/deliver-alert-channel";

/** F8's "alert storm" edge case: cap what goes IN the email, link to the rest. */
const MAX_ALERTS_PER_EMAIL = 10;
const MISSING_RESEND_KEY_ERROR = "RESEND_API_KEY is not set on the server";

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

            // Same recipient rules as the weekly digest: only active org members
            // who can still access this business (removed/suspended members and
            // members scoped to other locations get nothing).
            // Lookup errors throw (step retries) rather than reading as "nobody",
            // which would mark the alerts digested without emailing anyone.
            const { data: members, error: membersError } = await admin
                .from("organization_members")
                .select("user_id")
                .eq("organization_id", business.organization_id)
                .eq("status", "active");
            if (membersError) throw new Error(`AEO digest member lookup failed: ${membersError.message}`);
            const authorized = (await Promise.all((members ?? []).map(async (m) =>
                await userCanAccessBusinessOrThrow(admin, m.user_id, businessId) ? m.user_id : null
            ))).filter((id): id is string => id !== null);
            const { data: prefs, error: prefsError } = authorized.length ? await admin
                .from("notification_preferences")
                .select("*, users(email)")
                .eq("business_id", businessId)
                .in("user_id", authorized) : { data: [], error: null };
            if (prefsError) throw new Error(`AEO digest preference lookup failed: ${prefsError.message}`);

            const recipients = (prefs ?? [])
                .map((p) => p as { user_id: string; digest_enabled?: boolean; users: { email?: string } | null })
                .filter((p) => authorized.includes(p.user_id) && p.digest_enabled !== false && p.users?.email)
                .map((p) => ({ userId: p.user_id, email: p.users?.email as string }))
                .sort((a, b) => a.userId.localeCompare(b.userId));

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
                organizationId: business.organization_id,
                businessName: business.name,
                recipients,
                emailHtml,
                alertIds: alerts.map((a) => a.id),
                alerts,
            };
        });

        if (!digest) return { sent: false };

        for (const recipient of digest.recipients) {
            try {
                await step.run(`send-digest-${recipient.userId}`, async () => {
                    // A cached build step is not proof of current access. A DB
                    // error throws (retry); only a definite "no access" skips.
                    if (!(await userCanAccessBusinessOrThrow(admin, recipient.userId, businessId))) {
                        return { sent: false, skipped: "no_access" as const };
                    }
                    const result = await sendEmail({
                        to: recipient.email,
                        subject: `AEO alerts for ${digest.businessName}`,
                        html: digest.emailHtml,
                        idempotencyKey: `aeo-alert-digest:${event.id ?? businessId}:${recipient.userId}`,
                    });
                    if (result.sent) return result;
                    const message = `AEO alert digest send failed: ${result.error ?? "unknown error"}`;
                    if (result.error === MISSING_RESEND_KEY_ERROR) throw new NonRetriableError(message);
                    // sendEmail reports failure instead of throwing; throw so
                    // Inngest retries just this recipient's step.
                    throw new Error(message);
                });
            } catch (err) {
                // Retries exhausted or permanent (e.g. a rejected address). Log
                // and continue: failing the run would leave the alerts undigested
                // and the next daily cron would re-email every other recipient.
                logger.error({ err, businessId, userId: recipient.userId }, "[aeo-alert-digest] recipient send failed");
            }
        }

        const channels = await step.run("load-alert-channels", async () => {
            const result = await admin.from("aeo_alert_channels" as never)
                .select("id, channel_type, endpoint_ciphertext, signing_secret_ciphertext" as never)
                .eq("organization_id" as never, digest.organizationId as never)
                .eq("enabled" as never, true as never)
                .or(`business_id.is.null,business_id.eq.${businessId}` as never) as unknown as {
                    data: { id: string; channel_type: "slack" | "webhook"; endpoint_ciphertext: string; signing_secret_ciphertext: string | null }[] | null;
                };
            return result.data ?? [];
        });
        for (const channel of channels) {
            try {
                await step.run(`deliver-channel-${channel.id}`, async () => {
                    const status = async (s: "success" | "failed") => await admin.from("aeo_alert_channels" as never)
                        .update({ last_delivery_at: new Date().toISOString(), last_delivery_status: s } as never)
                        .eq("id" as never, channel.id as never);
                    try {
                        await deliverAlertChannel(channel, digest.alerts.slice(0, MAX_ALERTS_PER_EMAIL));
                        await status("success");
                    } catch (error) {
                        await status("failed");
                        throw error;
                    }
                });
            } catch (err) {
                // Retries exhausted; last_delivery_status already records the
                // failure. A dead webhook must not block (and re-send) the email.
                logger.error({ err, businessId, channelId: channel.id }, "[aeo-alert-digest] channel delivery failed");
            }
        }

        // Reached only after every recipient/channel step succeeded or used up
        // its retries (transient failures are retried, not silently counted as
        // sent). Steps are memoized, so a run retry re-sends to nobody.
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
