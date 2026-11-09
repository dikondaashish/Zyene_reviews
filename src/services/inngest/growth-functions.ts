import { inngest } from "@/services/inngest/client";
import { sendEmail } from "@/services/resend/send-email";
import { trialNurtureEmail, winbackFollowUpEmail } from "@/services/resend/templates/growth-emails";
import { TRIAL_NURTURE_STEPS, WINBACK_STEPS } from "@/lib/campaign-content/email-sequences-data";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { activeGrowthEmailPreferences } from "@/lib/growth/growth-email-preferences";

async function markSequenceCompleted(sequenceKey: string, email: string, organizationId?: string) {
    const admin = createAdminClient();
    let q = admin
        .from("growth_email_runs")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("sequence_key", sequenceKey)
        .eq("recipient_email", email.toLowerCase());
    q = q.eq("status", "active");
    if (organizationId) {
        q = q.eq("organization_id", organizationId);
    }
    await q;
}

/** Trial tips have nothing to say to a customer who already pays. */
async function organizationIsPaying(organizationId?: string): Promise<boolean> {
    if (!organizationId) return false;
    const { data, error } = await createAdminClient().from("organizations")
        .select("plan_status").eq("id", organizationId).maybeSingle();
    if (error) throw new Error("Unable to check organization plan");
    return data?.plan_status === "active";
}

/** Trial nurture (day 2 and day 7); the day-1 welcome is sent on signup. Stops once they pay. */
export const trialNurtureWorker = inngest.createFunction(
    { id: "growth-trial-nurture", name: "Growth Trial Nurture" },
    { event: "growth/trial-nurture.start" },
    async ({ event, step }) => {
        const { email, userName, dashboardUrl, organizationId } = event.data;

        for (let i = 0; i < TRIAL_NURTURE_STEPS.length; i++) {
            const nurtureStep = TRIAL_NURTURE_STEPS[i];
            const waitHours =
                i === 0
                    ? nurtureStep.delayHours
                    : nurtureStep.delayHours - TRIAL_NURTURE_STEPS[i - 1].delayHours;

            if (waitHours > 0) {
                await step.sleep(`wait-${nurtureStep.key}`, `${waitHours}h`);
            }

            const sent = await step.run(`send-${nurtureStep.key}`, async () => {
                if (await organizationIsPaying(organizationId)) return "paying" as const;
                const preferences = await activeGrowthEmailPreferences("trial_nurture", email, organizationId);
                if (!preferences) return "skipped" as const;
                const { subject, html } = trialNurtureEmail({
                    userName,
                    dashboardUrl,
                    stepKey: nurtureStep.key,
                    unsubscribeUrl: preferences.unsubscribeUrl,
                });
                await sendEmail({ stream: "marketing", to: email, subject, html, unsubscribeUrl: preferences.unsubscribeUrl });
                return "sent" as const;
            });
            if (sent === "paying") break;
        }

        await step.run("complete-sequence", async () => {
            await markSequenceCompleted("trial_nurture", email, organizationId);
        });
    }
);

export const winbackWorker = inngest.createFunction(
    { id: "growth-winback", name: "Growth Win-back Follow-up" },
    { event: "growth/winback.start" },
    async ({ event, step }) => {
        const { email, userName, rejoinUrl, organizationId } = event.data;
        const winStep = WINBACK_STEPS[0];

        await step.sleep(`wait-${winStep.key}`, `${winStep.delayHours}h`);

        await step.run(`send-${winStep.key}`, async () => {
            const preferences = await activeGrowthEmailPreferences("winback", email, organizationId);
            if (!preferences) return;
            const { subject, html } = winbackFollowUpEmail({ userName, rejoinUrl, unsubscribeUrl: preferences.unsubscribeUrl });
            await sendEmail({ stream: "marketing", to: email, subject, html, unsubscribeUrl: preferences.unsubscribeUrl });
        });

        await step.run("complete-sequence", async () => {
            await markSequenceCompleted("winback", email, organizationId);
        });
    }
);
