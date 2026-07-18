import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { dueBeforeIso } from "@/lib/campaigns/drip-phase1";
import { sendDripStep } from "@/lib/campaigns/drip-step-send";
import type { DripCampaignRow, DripRequestRow } from "@/lib/campaigns/drip-phase1-types";

const REQUEST_SELECT =
    "id, customer_name, customer_email, customer_phone, drip_status, drip_steps_sent, review_left, clicked_at, completed_at, last_drip_channel, sent_at, step2_sent_at";

export const followUpWorker = inngest.createFunction(
    { id: "follow-up-worker", name: "Process Follow-ups" },
    { event: "cron/follow-up.campaign" },
    async ({ event, step }) => {
        const { campaignId } = event.data as { campaignId: string };
        const admin = createAdminClient();

        await step.run("process-drip-steps", async () => {
            const { data: campaign } = await admin
                .from("campaigns")
                .select(
                    "id, follow_up_enabled, follow_up_template, drip_step3_template, drip_channel_alternate, channel, businesses (id, name, sender_name)",
                )
                .eq("id", campaignId)
                .single();

            const c = campaign as unknown as DripCampaignRow | null;
            if (!c?.follow_up_enabled) return;

            const cutoff = dueBeforeIso();

            const { data: step2Rows } = await admin
                .from("review_requests")
                .select(REQUEST_SELECT)
                .eq("campaign_id", campaignId)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 1)
                .eq("review_left", false)
                .is("clicked_at", null)
                .is("completed_at", null)
                .lt("sent_at", cutoff)
                .limit(100);

            for (const req of (step2Rows ?? []) as unknown as DripRequestRow[]) {
                await sendDripStep({
                    admin,
                    campaign: c,
                    req,
                    step: 2,
                    template: c.follow_up_template || undefined,
                });
            }

            const { data: step3Rows } = await admin
                .from("review_requests")
                .select(REQUEST_SELECT)
                .eq("campaign_id", campaignId)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 2)
                .eq("review_left", false)
                .is("clicked_at", null)
                .is("completed_at", null)
                .lt("step2_sent_at", cutoff)
                .limit(100);

            const step3Template = c.drip_step3_template || c.follow_up_template || undefined;

            for (const req of (step3Rows ?? []) as unknown as DripRequestRow[]) {
                await sendDripStep({
                    admin,
                    campaign: c,
                    req,
                    step: 3,
                    template: step3Template,
                });
            }
        });
    },
);
