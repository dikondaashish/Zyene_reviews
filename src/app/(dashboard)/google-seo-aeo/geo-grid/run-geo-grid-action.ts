"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import { inngest } from "@/services/inngest/client";
import {
    estimateGeoGridCostMicroUsd,
    maxGeoGridSizeForPlan,
    spacingMilesToMeters,
} from "@/services/aeo/geo-grid/geo-grid-plan";
import { resolveGoogleGridIdentity } from "./resolve-google-grid-identity";

const MIN_MINUTES_BETWEEN_GRIDS = 60;
const schema = z.object({
    businessId: z.string().uuid(),
    keyword: z.string().trim().min(2).max(120),
    gridSize: z.union([z.literal(5), z.literal(7), z.literal(9)]),
    spacingMiles: z.union([z.literal(0.5), z.literal(1), z.literal(2)]),
});

export type RunGeoGridResult =
    | { success: true; eventId?: string; estimatedCostMicroUsd: number }
    | { success: false; error: string; upgradeHref?: string };

async function canManageBusiness(businessId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();
    return ["owner", "admin", "manager"].includes(String(data?.role ?? "").toLowerCase());
}

export async function runGeoGridNow(input: unknown): Promise<RunGeoGridResult> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Choose a valid keyword, grid size, and spacing." };
    const { businessId, keyword, gridSize, spacingMiles } = parsed.data;
    if (!(await canManageBusiness(businessId))) {
        return { success: false, error: "You do not have permission to run a geo-grid." };
    }
    if (!isLiveSamplingEnabled()) {
        return { success: false, error: "Live sampling is switched off for this deployment." };
    }

    const admin = createAdminClient();
    const { data: business } = await admin
        .from("businesses")
        .select("organization_id, organizations!inner(plan, plan_status)")
        .eq("id", businessId)
        .single();
    const maxSize = maxGeoGridSizeForPlan(
        business?.organizations?.plan,
        business?.organizations?.plan_status
    );
    if (!business) return { success: false, error: "Business not found." };
    if (maxSize === 0 || gridSize > maxSize) {
        return {
            success: false,
            error: maxSize === 0
                ? "A paid, active subscription is required to run a geo-grid."
                : `Your plan supports grids up to ${maxSize} by ${maxSize}.`,
            upgradeHref: "/settings/billing",
        };
    }

    const { data: recent } = await admin
        .from("aeo_geo_grid_runs")
        .select("status, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (recent?.status === "running") {
        return { success: false, error: "A geo-grid is already running for this business." };
    }
    if (recent) {
        const minutesAgo = Math.round((Date.now() - new Date(recent.created_at).getTime()) / 60_000);
        if (minutesAgo < MIN_MINUTES_BETWEEN_GRIDS) {
            return { success: false, error: `A geo-grid ran ${minutesAgo} minutes ago. Please wait before spending on another.` };
        }
    }

    const identity = await resolveGoogleGridIdentity(businessId);
    if (!identity.ok) return { success: false, error: identity.error };
    const spacingMeters = spacingMilesToMeters(spacingMiles);
    const estimatedCostMicroUsd = estimateGeoGridCostMicroUsd(gridSize);
    const { data: run, error: insertError } = await admin
        .from("aeo_geo_grid_runs")
        .insert({
            business_id: businessId,
            keyword,
            grid_size: gridSize,
            spacing_meters: spacingMeters,
            center_lat: identity.lat,
            center_lng: identity.lng,
            status: "running",
            estimated_cost_micro_usd: estimatedCostMicroUsd,
            requested_units: gridSize * gridSize,
            is_estimated: false,
        })
        .select("id")
        .single();
    if (insertError || !run) return { success: false, error: "Could not create the geo-grid run." };

    try {
        const event = await inngest.send({
            name: "aeo/geo-grid.requested",
            data: {
                runId: run.id,
                businessId,
                organizationId: business.organization_id,
                keyword,
                gridSize,
                spacingMeters,
                centerLat: identity.lat,
                centerLng: identity.lng,
                placeId: identity.placeId,
                estimatedCostMicroUsd,
            },
        });
        revalidatePath("/google-seo-aeo/geo-grid");
        return { success: true, eventId: event.ids?.[0], estimatedCostMicroUsd };
    } catch {
        await admin.from("aeo_geo_grid_runs").update({
            status: "failed",
            error_message: "The job could not be queued.",
            completed_at: new Date().toISOString(),
        }).eq("id", run.id);
        return { success: false, error: "Failed to queue the geo-grid." };
    }
}
