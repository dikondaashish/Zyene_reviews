import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { campaignRateLimit } from "@/lib/auth/rate-limit";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { campaignSendSchema } from "@/services/campaigns/campaigns-schema";
import { loadCampaignAudience } from "@/services/campaigns/campaign-audience";
import { z } from "zod";

export async function handleCampaignSend(request: Request, campaignId: string) {
    if (!z.uuid().safeParse(campaignId).success) return apiError("Invalid campaign", { status: 400 });
    try {
        const supabase = await createClient();
        const admin = createAdminClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return apiError("Unauthorized", { status: 401 });
        }

        if (!user.email_confirmed_at) return apiError("Verify your email before sending a campaign.", { status: 403 });

        const { success: rateLimitSuccess } = await campaignRateLimit.limit(user.id);
        if (!rateLimitSuccess) {
            return apiError("Rate limit exceeded. Try again later.", { status: 429 });
        }

        const body = await request.json();
        const parsed = campaignSendSchema.safeParse(body);
        if (!parsed.success) {
            return apiError("Invalid data", { status: 400, details: JSON.stringify(parsed.error.flatten()) });
        }

        const { data: campaign } = await supabase
            .from("campaigns")
            .select("id, business_id, status, channel")
            .eq("id", campaignId)
            .maybeSingle();

        if (!campaign?.business_id) {
            return apiError("Campaign not found", { status: 404 });
        }
        const canAccess = await userCanAccessBusiness(supabase, user.id, campaign.business_id);
        if (!canAccess) {
            return apiError("Forbidden", { status: 403 });
        }

        if (campaign.status !== "active") {
            return apiError("Campaign is not active. Activate it first.", { status: 400 });
        }

        const contacts = parsed.data.customerIds
            ? await loadCampaignAudience(supabase, campaign.business_id, parsed.data.customerIds, campaign.channel)
            : parsed.data.contacts!;
        if (contacts.length === 0)
            return apiError(
                "No selected customers can receive this campaign. Check their contact details and opt-out status.",
                { status: 400 },
            );
        const skippedCount = parsed.data.customerIds ? new Set(parsed.data.customerIds).size - contacts.length : 0;
        const { inngest } = await import("@/services/inngest/client");

        const eventsToEnqueue = contacts.map((contact) => ({
            ...("customerId" in contact ? { id: `campaign:${campaignId}:customer:${contact.customerId}` } : {}),
            name: "campaign/send.contact" as const,
            data: {
                campaignId,
                businessId: campaign.business_id,
                contact: {
                    name: contact.name,
                    phone: contact.phone,
                    email: contact.email,
                },
            },
        }));

        try {
            await inngest.send(eventsToEnqueue);

            await admin.from("campaigns").update({ status: "processing" }).eq("id", campaignId);
        } catch (e) {
            logger.error({ err: e }, "Failed to enqueue campaign events:");
            return apiError("Failed to queue campaign", { status: 500 });
        }

        return apiOk({
            success: true,
            message: `Queued ${eventsToEnqueue.length} contacts for background processing`,
            queuedCount: eventsToEnqueue.length,
            skippedCount,
        });
    } catch (error) {
        logger.error({ err: error, campaignId }, "Campaign queue failed");
        return apiError("Could not queue this campaign. Your campaign is saved; check its status before retrying.", {
            status: 500,
        });
    }
}
