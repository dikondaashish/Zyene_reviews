"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { isLiveContentBriefsEnabled } from "@/lib/features/aeo-surfaces";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plan-entitlements";
import { generateAndStoreBrief } from "@/services/aeo/content-briefs/generate-and-store-brief";

/** One real Gemini call plus up to 5 real outbound fetches per generation — a genuine cooldown, not busywork. */
const MIN_MINUTES_BETWEEN_BRIEFS = 60;

export type GenerateBriefResult = { success: true; briefId: string } | { success: false; error: string };

export async function generateContentBriefNow(businessId: string, promptId: string): Promise<GenerateBriefResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: membership } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();
    const role = String(membership?.role || "").toLowerCase();
    if (!["owner", "admin", "manager"].includes(role)) {
        return { success: false, error: "You do not have permission to generate a brief." };
    }

    if (!isLiveContentBriefsEnabled()) {
        return { success: false, error: "Content brief generation is not yet enabled for this deployment." };
    }

    const { data: business } = await supabase
        .from("businesses")
        .select("organization_id")
        .eq("id", businessId)
        .maybeSingle();
    if (!business) return { success: false, error: "Business not found." };

    const { data: org } = await supabase
        .from("organizations")
        .select("plan, plan_status")
        .eq("id", business.organization_id)
        .maybeSingle();
    if (!org || !planAllowsAiReviewFeatures(org.plan, org.plan_status ?? null)) {
        return { success: false, error: "Content briefs require an active Starter, Professional, or Enterprise plan." };
    }

    const { data: recent } = await supabase
        .from("aeo_content_briefs")
        .select("created_at")
        .eq("business_id", businessId)
        .eq("prompt_id", promptId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (recent) {
        const minutesAgo = Math.round((Date.now() - new Date(recent.created_at).getTime()) / 60_000);
        if (minutesAgo < MIN_MINUTES_BETWEEN_BRIEFS) {
            return {
                success: false,
                error: `A brief was generated ${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago for this prompt. Please wait before generating another.`,
            };
        }
    }

    const admin = createAdminClient();
    const result = await generateAndStoreBrief(admin, { businessId, promptId });

    if (!result.ok) {
        const messages: Record<string, string> = {
            prompt_not_found: "Prompt not found.",
            business_not_found: "Business not found.",
            generation_failed: "Brief generation failed. Please try again.",
        };
        return { success: false, error: messages[result.reason] ?? "Failed to generate brief." };
    }

    revalidatePath(`/google-seo-aeo/prompts/${promptId}`);
    return { success: true, briefId: result.briefId };
}
