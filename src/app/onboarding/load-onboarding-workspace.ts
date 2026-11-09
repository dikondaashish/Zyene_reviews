import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingBusiness, OnboardingOrganization } from "./onboarding-types";
import { loadOnboardingBusiness } from "./load-onboarding-business";

export const WORKSPACE_MISSING_MESSAGE =
    "We couldn't find your business. Try again, or email support@zyenereviews.com if this keeps happening.";

export type OnboardingWorkspace =
    | {
          ok: true;
          organization: OnboardingOrganization | null;
          business: OnboardingBusiness | null;
          googleConnected: boolean;
      }
    | { ok: false; error: string };

/** The signed-in user's organization and its newest business, both null when setup never finished. */
export async function loadOnboardingWorkspace(
    supabase: SupabaseClient,
    userId: string,
): Promise<OnboardingWorkspace> {
    const { data: member, error: memberErr } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
    if (memberErr) return { ok: false, error: memberErr.message };
    if (!member?.organization_id) {
        return { ok: true, organization: null, business: null, googleConnected: false };
    }

    const { data: org } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("id", member.organization_id)
        .maybeSingle();
    const { business, googleConnected } = await loadOnboardingBusiness(supabase, member.organization_id);
    return {
        ok: true,
        organization: (org as OnboardingOrganization | null) ?? null,
        business,
        googleConnected: business ? googleConnected : false,
    };
}
