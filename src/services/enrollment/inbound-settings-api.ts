import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { isPublicProviderEntry, normalizeAllowedSenders } from "@/lib/enrollment/inbound-email-parse";
import { formatInboundAddress, newAddressToken } from "@/lib/enrollment/inbound-address";

export type InboundSettings = {
    configured: boolean; address: string | null; enabled: boolean; campaignId: string | null; allowedSenders: string[];
};

const putSchema = z.object({
    businessId: z.uuid(),
    enabled: z.boolean(),
    campaignId: z.uuid().nullable(),
    allowedSenders: z.array(z.string().max(320)).max(25),
});

function fail(error: unknown, fallback: string) {
    if (!(error instanceof ApiRouteError)) logger.error({ err: error }, `[inbound-settings] ${fallback}`);
    const e = toApiError(error);
    return apiError(e.status >= 500 ? fallback : e.message, { status: e.status, code: e.code });
}

export async function loadInboundSettings(admin: SupabaseClient, businessId: string): Promise<InboundSettings> {
    const domain = process.env.INBOUND_EMAIL_DOMAIN?.trim().toLowerCase() || null;
    const { data } = await admin.from("business_inbound_addresses")
        .select("address_token, enabled, campaign_id, allowed_senders").eq("business_id", businessId).maybeSingle();
    return {
        // Without an inbound domain + webhook secret the address cannot receive mail: say so, don't fake it.
        configured: Boolean(domain && process.env.RESEND_INBOUND_WEBHOOK_SECRET),
        address: data && domain ? formatInboundAddress(data.address_token as string, domain) : null,
        enabled: Boolean(data?.enabled), campaignId: (data?.campaign_id as string | null) ?? null,
        allowedSenders: (data?.allowed_senders as string[] | undefined) ?? [],
    };
}

export async function handleGetInboundSettings(request: Request) {
    try {
        const businessId = z.uuid().safeParse(new URL(request.url).searchParams.get("businessId"));
        if (!businessId.success) throw new ApiRouteError("Invalid business", { status: 400 });
        const { supabase, user } = await requireUser();
        if (!(await userCanAccessBusiness(supabase, user.id, businessId.data))) throw new ApiRouteError("Forbidden", { status: 403 });
        return apiOk(await loadInboundSettings(createAdminClient(), businessId.data));
    } catch (error) {
        return fail(error, "Could not load email enrollment settings");
    }
}

export async function handlePutInboundSettings(request: Request) {
    try {
        const parsed = putSchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Invalid settings", { status: 400 });
        const { businessId, enabled, campaignId } = parsed.data;
        const { supabase, user } = await requireUser();
        if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            throw new ApiRouteError("Only owners, admins and managers can change email enrollment", { status: 403 });
        }
        const publicEntry = parsed.data.allowedSenders.find(isPublicProviderEntry);
        if (publicEntry) {
            throw new ApiRouteError(`Add your exact address (like you${publicEntry.trim().toLowerCase()}) instead of all of ${publicEntry.trim()}`, { status: 400 });
        }
        const allowedSenders = normalizeAllowedSenders(parsed.data.allowedSenders);
        if (enabled && (!campaignId || allowedSenders.length === 0)) {
            throw new ApiRouteError("Choose a campaign and add at least one allowed sender before turning this on", { status: 400 });
        }
        const admin = createAdminClient();
        if (campaignId) {
            const { data: campaign } = await admin.from("campaigns").select("id").eq("id", campaignId).eq("business_id", businessId).maybeSingle();
            if (!campaign) throw new ApiRouteError("Campaign not found", { status: 400 });
        }
        const { data: existing } = await admin.from("business_inbound_addresses").select("address_token").eq("business_id", businessId).maybeSingle();
        const { data: business } = existing ? { data: null } : await admin.from("businesses").select("slug, name").eq("id", businessId).maybeSingle();
        const { error } = await admin.from("business_inbound_addresses").upsert({
            business_id: businessId, address_token: existing?.address_token ?? newAddressToken(business?.slug || business?.name || ""),
            enabled, campaign_id: campaignId, allowed_senders: allowedSenders, updated_by: user.id, updated_at: new Date().toISOString(),
        }, { onConflict: "business_id" });
        if (error) throw error;
        return apiOk(await loadInboundSettings(admin, businessId));
    } catch (error) {
        return fail(error, "Could not save email enrollment settings");
    }
}
