import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const patchCampaignSchema = z.object({
    name: z.string().min(1).max(150).optional(),
    status: z.enum(["draft", "active", "paused", "processing", "completed", "archived"]).optional(),
    trigger_type: z.string().max(50).optional(),
    channel: z.enum(["sms", "email", "both"]).optional(),
    sms_template: z.string().max(5000).optional(),
    email_subject: z.string().max(255).optional(),
    email_template: z.string().max(20000).optional(),
    delay_minutes: z.number().int().min(0).max(7 * 24 * 60).optional(),
    follow_up_enabled: z.boolean().optional(),
    follow_up_delay_hours: z.number().int().min(0).max(30 * 24).optional(),
    follow_up_template: z.string().max(5000).optional(),
}).superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No valid fields to update",
        });
    }
});

// Helper: verify ownership of a campaign
async function verifyCampaignOwnership(supabase: SupabaseClient, userId: string, campaignId: string) {
    const { data: campaignById } = await supabase
        .from("campaigns")
        .select("id, business_id")
        .eq("id", campaignId)
        .maybeSingle();
    if (!campaignById?.business_id) return null;

    const allowed = await userCanAccessBusiness(supabase, userId, campaignById.business_id);
    if (!allowed) return null;

    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("business_id", campaignById.business_id)
        .single();

    return campaign;
}

// GET /api/campaigns/[id] — single campaign with stats
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { requestId } = createRequestLogger("GET /api/campaigns/[id]");
    const supabase = await createClient();
    const { id: campaignId } = await params;

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

    // Also fetch associated review_requests for the contacts table
    const { data: requests } = await supabase
        .from("review_requests")
        .select("id, customer_name, customer_phone, customer_email, channel, status, sent_at, opened_at, clicked_at, created_at")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

    return apiOk({ campaign, requests: requests || [], requestId });
}

// PATCH /api/campaigns/[id] — update campaign
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { requestId } = createRequestLogger("PATCH /api/campaigns/[id]");
    const supabase = await createClient();
    const { id: campaignId } = await params;

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

    // Force email verification for active campaigns
    if (body.status === "active" && !user.email_confirmed_at) {
        return apiError("Email verification required", {
            status: 403,
            code: "EMAIL_NOT_VERIFIED",
            details: requestId,
        });
    }

    // Only allow safe fields to update
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
        console.error("Campaign update error:", error);
        return apiError("Failed to update campaign", { status: 500, details: requestId });
    }

    return apiOk({ campaign: updated, requestId });
}

// DELETE /api/campaigns/[id] — delete campaign
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { requestId } = createRequestLogger("DELETE /api/campaigns/[id]");
    const supabase = await createClient();
    const { id: campaignId } = await params;

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
        console.error("Campaign delete error:", error);
        return apiError("Failed to delete campaign", { status: 500, details: requestId });
    }

    return apiOk({ success: true, requestId });
}
