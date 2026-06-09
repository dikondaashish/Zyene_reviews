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
    const googlePlatform = biz.review_platforms?.find(
        (p: { platform?: string }) => p.platform === "google"
    ) as
        | {
              platform?: string;
              google_location_id?: string | null;
              sync_status?: string | null;
          }
        | undefined;

    const hasGoogle = Boolean(googlePlatform?.google_location_id);
    const syncStatus = String(googlePlatform?.sync_status ?? "").toLowerCase();
    const canCatchUpSync = hasGoogle && !syncStatus.startsWith("error_");

    if (canCatchUpSync) {
        triggerOnboardingSync(biz.id).catch(() => {});
    }

    return { business, googleConnected: hasGoogle };
}
