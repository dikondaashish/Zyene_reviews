import { z } from "zod";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { MAX_IMPORT_ROWS, summarizeImportRows, validateImportRows } from "@/lib/enrollment/validate-import-rows";
import { loadImportProgress } from "@/services/enrollment/import-progress";

const rowSchema = z.object({
    name: z.string().max(200).optional().nullable(),
    phone: z.string().max(40).optional().nullable(),
    email: z.string().max(320).optional().nullable(),
});
const createSchema = z.object({
    fileName: z.string().trim().max(255).optional(),
    dailyLimit: z.number().int().min(1).max(500),
    // The owner's statement that they may contact these customers. Not customer consent.
    consentConfirmed: z.literal(true),
    rows: z.array(rowSchema).min(1).max(MAX_IMPORT_ROWS),
});
const updateSchema = z.object({
    status: z.enum(["active", "paused", "cancelled"]).optional(),
    dailyLimit: z.number().int().min(1).max(500).optional(),
}).refine((v) => v.status || v.dailyLimit, "Nothing to update");

function fail(error: unknown, fallback: string) {
    if (!(error instanceof ApiRouteError)) logger.error({ err: error }, `[enrollment-imports] ${fallback}`);
    const e = toApiError(error);
    return apiError(e.status >= 500 ? fallback : e.message, { status: e.status, code: e.code, details: e.details });
}

async function authorizedCampaign(campaignId: string, write: boolean) {
    if (!z.uuid().safeParse(campaignId).success) throw new ApiRouteError("Campaign not found", { status: 404 });
    const { supabase, user } = await requireUser();
    const admin = createAdminClient();
    const { data: campaign } = await admin.from("campaigns").select("id, business_id, channel, status").eq("id", campaignId).maybeSingle();
    if (!campaign || !(await userCanAccessBusiness(supabase, user.id, campaign.business_id, write))) {
        throw new ApiRouteError("Campaign not found", { status: 404 });
    }
    return { admin, user, campaign: campaign as { id: string; business_id: string; channel: "sms" | "email" | "both"; status: string } };
}

export async function handleCreateImport(request: Request, campaignId: string) {
    try {
        const parsed = createSchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Check the file and confirm you may contact these customers", { status: 400 });
        const { admin, user, campaign } = await authorizedCampaign(campaignId, true);
        if (["archived", "completed"].includes(campaign.status)) throw new ApiRouteError("This campaign is closed", { status: 400 });

        const rows = validateImportRows(parsed.data.rows, campaign.channel);
        const summary = summarizeImportRows(rows);
        if (summary.valid === 0) throw new ApiRouteError("No rows in this file can be enrolled", { status: 400 });
        const now = new Date().toISOString();
        const { data: created, error } = await admin.from("enrollment_imports").insert({
            business_id: campaign.business_id, campaign_id: campaign.id, source: "csv", file_name: parsed.data.fileName || null,
            status: "active", daily_limit: parsed.data.dailyLimit, total_rows: summary.total, valid_rows: summary.valid,
            invalid_rows: summary.invalid, duplicate_rows: summary.duplicate, created_by: user.id,
            consent_confirmed_by: user.id, consent_confirmed_at: now,
        }).select("id").single();
        if (error || !created) throw error ?? new Error("Import not created");

        for (let i = 0; i < rows.length; i += 500) {
            const { error: rowError } = await admin.from("enrollment_import_rows").insert(rows.slice(i, i + 500).map((r) => ({
                import_id: created.id, business_id: campaign.business_id, row_number: r.rowNumber, customer_name: r.customerName,
                phone: r.phone, email: r.email, identity_key: r.identityKey, status: r.status, reason: r.reason,
            })));
            if (rowError) {
                await admin.from("enrollment_imports").delete().eq("id", created.id);
                throw rowError;
            }
        }
        return apiOk({ id: created.id, ...summary }, { status: 201 });
    } catch (error) {
        return fail(error, "Could not create the import");
    }
}

export async function handleListImports(campaignId: string) {
    try {
        const { admin, campaign } = await authorizedCampaign(campaignId, false);
        return apiOk({ imports: await loadImportProgress(admin, campaign.business_id, campaign.id) });
    } catch (error) {
        return fail(error, "Could not load imports");
    }
}

export async function handleUpdateImport(request: Request, campaignId: string, importId: string) {
    try {
        if (!z.uuid().safeParse(importId).success) throw new ApiRouteError("Import not found", { status: 404 });
        const parsed = updateSchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Invalid update", { status: 400 });
        const { admin, campaign } = await authorizedCampaign(campaignId, true);
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (parsed.data.status) patch.status = parsed.data.status;
        if (parsed.data.dailyLimit) patch.daily_limit = parsed.data.dailyLimit;
        const { data, error } = await admin.from("enrollment_imports").update(patch)
            .eq("id", importId).eq("campaign_id", campaign.id).eq("business_id", campaign.business_id)
            .in("status", ["active", "paused"]).select("id, status, daily_limit").maybeSingle();
        if (error) throw error;
        if (!data) throw new ApiRouteError("This import is finished or was not found", { status: 409 });
        if (parsed.data.status === "cancelled") {
            await admin.from("enrollment_import_rows").update({ status: "cancelled", reason: "Import cancelled" })
                .eq("import_id", importId).eq("status", "pending");
        }
        return apiOk(data);
    } catch (error) {
        return fail(error, "Could not update the import");
    }
}
