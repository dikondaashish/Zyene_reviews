"use server";

import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageCompetitors } from "@/lib/competitors/watch-access";
import { loadMarketPositioningBriefContext } from "@/lib/competitors/market-brief-context";
import { generateMarketPositioningBrief } from "@/domains/ai/services/generateMarketPositioningBrief";

const MODEL_LABEL =
    process.env.GOOGLE_AI_LITE_MODEL?.trim() || "gemini-3.1-flash-lite-preview";

/**
 * Owner/admin: generate and persist a Gemini market positioning brief using only stored
 * public competitor fields + your GBP keyword data (no private competitor dashboards).
 */
export async function generateCompetitorMarketBriefNow(businessId: string): Promise<{
    success: boolean;
    error?: string;
    id?: string;
}> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not signed in." };
    }

    const { data: member, error: memErr } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (memErr || !member || !canManageCompetitors(member.role)) {
        return { success: false, error: "You do not have permission to generate this brief." };
    }

    const ctx = await loadMarketPositioningBriefContext(supabase, businessId);
    if (!ctx.ok) {
        return { success: false, error: ctx.error };
    }

    const brief = await generateMarketPositioningBrief(ctx.input);
    if (!brief) {
        return { success: false, error: "Could not generate a brief (no competitors)." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    const { data: inserted, error: insErr } = await (supabase.from("competitor_market_briefs" as never) as any)
        .insert({
            business_id: businessId,
            headline: brief.headline,
            overview: brief.overview,
            positioning_bullets: brief.positioningBullets,
            opportunity_actions: brief.opportunityActions,
            data_limitations: brief.dataLimitations,
            model: MODEL_LABEL,
        })
        .select("id")
        .single();

    if (insErr || !inserted) {
        console.error("[generateCompetitorMarketBriefNow] insert failed:", insErr);
        return { success: false, error: insErr?.message || "Failed to save brief." };
    }

    revalidatePath("/competitors");
    return { success: true, id: (inserted as { id: string }).id };
}
