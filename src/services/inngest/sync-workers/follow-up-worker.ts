import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { dueBeforeIso } from "@/lib/campaigns/drip-phase1";
import { sendDripStep } from "@/lib/campaigns/drip-step-send";
import type { DripCampaignRow, DripRequestRow } from "@/lib/campaigns/drip-phase1-types";
import { DRIP_CAMPAIGN_SELECT, DRIP_REQUEST_SELECT } from "@/lib/campaigns/drip-send-context";
import { z } from "zod";

export const followUpWorker = inngest.createFunction(
    { id: "follow-up-worker", name: "Process Follow-ups", concurrency: { limit: 1, key: "event.data.campaignId" } },
    { event: "cron/follow-up.campaign" },
    async ({ event, step }) => {
        const { campaignId } = event.data;
        const deliveryId = event.id;
        if (!deliveryId || !z.uuid().safeParse(campaignId).success) return;
        const admin = createAdminClient();

        await step.run("process-drip-steps", async () => {
            const { data: campaign, error: campaignError } = await admin
                .from("campaigns")
                .select(DRIP_CAMPAIGN_SELECT)
                .eq("id", campaignId)
                .eq("status", "active")
                .single();

            const c = campaign as unknown as DripCampaignRow | null;
            const business = Array.isArray(c?.businesses) ? c.businesses[0] : c?.businesses;
            if (campaignError) throw campaignError;
            if (c?.id !== campaignId || !c.follow_up_enabled || c.status !== "active" ||
                !z.uuid().safeParse(c.business_id).success || business?.id !== c.business_id) return;

            const cutoff = dueBeforeIso();

            const { data: step2Rows, error: step2Error } = await admin
                .from("review_requests")
                .select(DRIP_REQUEST_SELECT)
                .eq("campaign_id", campaignId)
                .eq("business_id", c.business_id)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 1)
                .eq("review_left", false)
                .is("clicked_at", null)
                .is("completed_at", null)
                .lt("sent_at", cutoff)
                .limit(100);
            if (step2Error) throw step2Error;

            for (const req of (step2Rows ?? []) as unknown as DripRequestRow[]) {
                await sendDripStep({
                    admin,
                    campaign: c,
                    req,
                    step: 2,
                    deliveryId,
                });
            }

            const { data: step3Rows, error: step3Error } = await admin
                .from("review_requests")
                .select(DRIP_REQUEST_SELECT)
                .eq("campaign_id", campaignId)
                .eq("business_id", c.business_id)
                .eq("drip_status", "active")
                .eq("drip_steps_sent", 2)
                .eq("review_left", false)
                .is("clicked_at", null)
                .is("completed_at", null)
                .lt("step2_sent_at", cutoff)
                .limit(100);
            if (step3Error) throw step3Error;

            for (const req of (step3Rows ?? []) as unknown as DripRequestRow[]) {
                await sendDripStep({
                    admin,
                    campaign: c,
                    req,
                    step: 3,
                    deliveryId,
                });
            }
        });
    },
);
