"use server";

import { createClient } from "@/lib/db/supabase/server";
import { isEligibleForIntroTrial } from "@/lib/stripe/checkout-trial-eligibility";

export async function getCheckoutTrialEligibilityForOrganization(
    organizationId: string
): Promise<{ eligible: boolean }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { eligible: true };
    }

    const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .maybeSingle();

    if (!member) {
        return { eligible: true };
    }

    const { data: org } = await supabase
        .from("organizations")
        .select("stripe_customer_id")
        .eq("id", organizationId)
        .single();

    const eligible = await isEligibleForIntroTrial(org?.stripe_customer_id ?? null);
    return { eligible };
}
