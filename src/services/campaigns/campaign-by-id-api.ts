import { createClient } from "@/lib/db/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { patchCampaignSchema } from "./campaign-schema";
import { verifyCampaignOwnership } from "./campaign-access";

export async function handleCampaignGet(campaignId: string) {
    const { requestId } = createRequestLogger("GET /api/campaigns/[id]");
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    const campaign = await verifyCampaignOwnership(supabase, user.id, campaignId);
    if (!campaign) {
        return apiError("Campaign not found", { status: 404, details: requestId });
    }

    const { data: requests } = await supabase
        .from("review_requests")
        .select("id, customer_name, customer_phone, customer_email, channel, status, sent_at, opened_at, clicked_at, created_at")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

    return apiOk({ campaign, requests: requests || [], requestId });
}

export async function handleCampaignPatch(request: Request, campaignId: string) {
    const { logger, requestId } = createRequestLogger("PATCH /api/campaigns/[id]");
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    const campaign = await verifyCampaignOwnership(supabase, user.id, campaignId);
    if (!campaign) {
        return apiError("Campaign not found", { status: 404, details: requestId });
    }

    const parsed = patchCampaignSchema.safeParse(await request.json());
    if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message || "Invalid campaign payload", {
            status: 400,
            details: requestId,
        });
    }

    const body = parsed.data;

    if (body.status === "active" && !user.email_confirmed_at) {
        return apiError("Email verification required", {
            status: 403,
            code: "EMAIL_NOT_VERIFIED",
            details: requestId,
        });
    }

    const allowedFields = [
        "name", "status", "trigger_type", "channel",
        "sms_template", "email_subject", "email_template",
        "delay_minutes", "follow_up_enabled", "follow_up_delay_hours", "follow_up_template",
    ];

    const updates: Record<string, string | number | boolean | null> = {};
    for (const key of allowedFields) {
        if (body[key as keyof typeof body] !== undefined) {
            const value = body[key as keyof typeof body];
            updates[key] = value ?? null;
        }
    }

    if (Object.keys(updates).length === 0) {
        return apiError("No valid fields to update", { status: 400, details: requestId });
    }

    const { data: updated, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", campaignId)
        .select()
        .single();

    if (error) {
        logger.error({ err: error }, "Campaign update error:");
        return apiError("Failed to update campaign", { status: 500, details: requestId });
    }

    return apiOk({ campaign: updated, requestId });
}

export async function handleCampaignDelete(campaignId: string) {
    const { logger, requestId } = createRequestLogger("DELETE /api/campaigns/[id]");
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    const campaign = await verifyCampaignOwnership(supabase, user.id, campaignId);
    if (!campaign) {
        return apiError("Campaign not found", { status: 404, details: requestId });
    }

    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

    if (error) {
        logger.error({ err: error }, "Campaign delete error:");
        return apiError("Failed to delete campaign", { status: 500, details: requestId });
    }

    return apiOk({ success: true, requestId });
}
