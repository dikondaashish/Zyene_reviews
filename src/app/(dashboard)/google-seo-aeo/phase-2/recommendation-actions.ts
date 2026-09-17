"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePhase2Context } from "./action-context";
import { loadRecommendationSnapshot } from "@/services/aeo/content-briefs/recommendation-impact";
import { refreshRecommendations } from "@/services/aeo/content-briefs/refresh-recommendations";
import { isBusinessWebsitePage } from "@/services/aeo/content-briefs/owned-page";

export async function refreshRecommendationQueue() {
    const { admin, businessId } = await requirePhase2Context();
    await refreshRecommendations(admin, businessId);
    revalidatePath("/google-seo-aeo/phase-2");
}

export async function updateRecommendationStatus(formData: FormData) {
    const parsed = z.object({ id: z.string().uuid(), status: z.enum(["applied", "dismissed"]) }).safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error("Invalid recommendation update");
    const { admin, businessId } = await requirePhase2Context();
    const recommendation = await admin.from("aeo_recommendations" as never).select("target_url" as never)
        .eq("id" as never, parsed.data.id as never).eq("business_id" as never, businessId as never).single() as unknown as { data: { target_url: string | null } | null };
    if (!recommendation.data) throw new Error("Recommendation not found");
    if (parsed.data.status === "applied" && recommendation.data.target_url) {
        const { data: business } = await admin.from("businesses").select("website").eq("id", businessId).single();
        if (!isBusinessWebsitePage(recommendation.data.target_url, business?.website)) throw new Error("This page is outside your business website");
    }
    const baseline = parsed.data.status === "applied" ? await loadRecommendationSnapshot(admin, businessId, recommendation.data.target_url) : null;
    const update = parsed.data.status === "applied"
        ? { status: "applied", applied_at: new Date().toISOString(), baseline, updated_at: new Date().toISOString() }
        : { status: "dismissed", updated_at: new Date().toISOString() };
    const result = await admin.from("aeo_recommendations" as never).update(update as never)
        .eq("id" as never, parsed.data.id as never).eq("business_id" as never, businessId as never);
    if (result.error) throw new Error("Unable to update recommendation");
    revalidatePath("/google-seo-aeo/phase-2");
}
