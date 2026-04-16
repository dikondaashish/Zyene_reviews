"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { inngest } from "@/services/inngest/client";

async function canManageBusiness(businessId: string): Promise<boolean> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

    const role = String(data?.role || "").toLowerCase();
    return role === "owner" || role === "admin" || role === "manager";
}

export async function runAiVisibilityAuditNow(
    businessId: string,
    query: string
): Promise<{ success: boolean; error?: string; eventId?: string }> {
    if (!(await canManageBusiness(businessId))) {
        return { success: false, error: "You do not have permission to run this audit." };
    }
    try {
        const evt = await inngest.send({
            name: "google-seo-aeo/ai-visibility.run",
            data: { businessId, query },
        });
        revalidatePath("/google-seo-aeo");
        return { success: true, eventId: evt.ids?.[0] };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to queue AI visibility audit." };
    }
}

export async function runHeatmapAuditNow(
    businessId: string,
    keyword: string
): Promise<{ success: boolean; error?: string; eventId?: string }> {
    if (!(await canManageBusiness(businessId))) {
        return { success: false, error: "You do not have permission to run this audit." };
    }
    try {
        const evt = await inngest.send({
            name: "google-seo-aeo/heatmap.run",
            data: { businessId, keyword },
        });
        revalidatePath("/google-seo-aeo");
        return { success: true, eventId: evt.ids?.[0] };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to queue heatmap audit." };
    }
}

export async function runGoogleSeoAeoSyncNow(
    businessId: string
): Promise<{ success: boolean; error?: string; eventId?: string }> {
    if (!(await canManageBusiness(businessId))) {
        return { success: false, error: "You do not have permission to run this sync." };
    }
    try {
        const evt = await inngest.send({
            name: "google-seo-aeo/sync.run",
            data: { businessId, trigger: "manual" },
        });
        revalidatePath("/google-seo-aeo");
        return { success: true, eventId: evt.ids?.[0] };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to queue sync." };
    }
}

