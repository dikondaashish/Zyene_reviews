import { inngest } from "./client";
import { sendEmail } from "@/services/resend/send-email";
import {
    trialNurtureEmail,
    onboardingDripEmail,
    winbackFollowUpEmail,
    marketingNurtureEmail,
} from "@/services/resend/templates/growth-emails";
import {
    TRIAL_NURTURE_STEPS,
    ONBOARDING_DRIP_STEPS,
    WINBACK_STEPS,
    MARKETING_NURTURE_STEPS,
} from "@/lib/phase6/email-sequences-data";
import { createAdminClient } from "@/lib/db/supabase/admin";

async function markSequenceCompleted(sequenceKey: string, email: string, organizationId?: string) {
    const admin = createAdminClient();
    let q = admin
        .from("growth_email_runs")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("sequence_key", sequenceKey)
        .eq("recipient_email", email.toLowerCase());
    if (organizationId) {
        q = q.eq("organization_id", organizationId);
    }
    await q;
}

/** Trial nurture (days 2–7) — one email per step; day-1 welcome is sent on signup */
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

            await step.run(`send-${nurtureStep.key}`, async () => {
                const { subject, html } = trialNurtureEmail({
                    userName,
                    dashboardUrl,
                    stepKey: nurtureStep.key,
                });
                await sendEmail({ to: email, subject, html });
            });
        }

        await step.run("complete-sequence", async () => {
            await markSequenceCompleted("trial_nurture", email, organizationId);
        });
    }
);

export const onboardingDripWorker = inngest.createFunction(
    { id: "growth-onboarding-drip", name: "Growth Onboarding Drip" },
    { event: "growth/onboarding-drip.start" },
    async ({ event, step }) => {
        const { email, userName, dashboardUrl, billingUrl, organizationId } = event.data;

        for (let i = 0; i < ONBOARDING_DRIP_STEPS.length; i++) {
            const dripStep = ONBOARDING_DRIP_STEPS[i];
            const waitHours =
                i === 0
                    ? dripStep.delayHours
                    : dripStep.delayHours - ONBOARDING_DRIP_STEPS[i - 1].delayHours;

            if (waitHours > 0) {
                await step.sleep(`wait-${dripStep.key}`, `${waitHours}h`);
            }

            await step.run(`send-${dripStep.key}`, async () => {
                const url = dripStep.key.includes("billing") || dripStep.key.includes("pricing")
                    ? billingUrl
                    : dashboardUrl;
                const { subject, html } = onboardingDripEmail({
                    userName,
                    dashboardUrl: url,
                    stepKey: dripStep.key,
                });
                await sendEmail({ to: email, subject, html });
            });
        }

        await step.run("complete-sequence", async () => {
            await markSequenceCompleted("onboarding_drip", email, organizationId);
        });
    }
);

/** Newsletter / checklist leads — 3-email nurture (excludes template pack immediate pack email) */
export const marketingNurtureWorker = inngest.createFunction(
    { id: "growth-marketing-nurture", name: "Growth Marketing Nurture" },
    { event: "growth/marketing-nurture.start" },
    async ({ event, step }) => {
        const { email } = event.data;

        for (let i = 0; i < MARKETING_NURTURE_STEPS.length; i++) {
            const nurtureStep = MARKETING_NURTURE_STEPS[i];
            const waitHours =
                i === 0
                    ? nurtureStep.delayHours
                    : nurtureStep.delayHours - MARKETING_NURTURE_STEPS[i - 1].delayHours;

            if (waitHours > 0) {
                await step.sleep(`wait-${nurtureStep.key}`, `${waitHours}h`);
            }

            await step.run(`send-${nurtureStep.key}`, async () => {
                const { subject, html } = marketingNurtureEmail({
                    email,
                    stepKey: nurtureStep.key,
                });
                await sendEmail({ to: email, subject, html });
            });
        }

        await step.run("complete-sequence", async () => {
            await markSequenceCompleted("marketing_nurture", email);
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
            const { subject, html } = winbackFollowUpEmail({ userName, rejoinUrl });
            await sendEmail({ to: email, subject, html });
        });

        await step.run("complete-sequence", async () => {
            await markSequenceCompleted("winback", email, organizationId);
        });
    }
);
