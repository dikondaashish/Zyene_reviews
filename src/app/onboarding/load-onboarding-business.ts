import type { SupabaseClient } from "@supabase/supabase-js";
import { triggerOnboardingSync } from "@/app/actions/onboarding";
import type { OnboardingBusiness } from "./onboarding-types";

export async function loadOnboardingBusiness(
    supabase: SupabaseClient,
    organizationId: string
): Promise<{ business: OnboardingBusiness | null; googleConnected: boolean }> {
    const { data: biz } = await supabase
        .from("businesses")
        .select("id, name, city, category, address_line1, state, phone, review_platforms(*)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (!biz) {
        return { business: null, googleConnected: false };
    }

    const business: OnboardingBusiness = {
        ...biz,
        city: biz.city ?? null,
    };
    const hasGoogle = biz.review_platforms?.some(
        (p: { platform?: string }) => p.platform === "google"
    );

    if (hasGoogle) {
        triggerOnboardingSync(biz.id).catch(() => {});
    }

    return { business, googleConnected: hasGoogle };
}
