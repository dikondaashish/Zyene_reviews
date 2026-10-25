import type { SupabaseClient, User } from "@supabase/supabase-js";
import { reviewCaptureBaseUrl } from "@/lib/review-requests/review-capture-url";
import { summarizeReplyRules } from "@/lib/reviews/reply-rules-summary";
import { loadReplyRulesSummary } from "@/services/reviews/reply-rules-summary-load";
import type { WelcomeTourData } from "@/components/dashboard/welcome-tour/welcome-tour-types";

/** Data for the one-time welcome after onboarding. Reads with the owner's RLS client. */
export async function loadWelcomeTour(
    supabase: SupabaseClient,
    input: { user: User; business: { id: string; name: string; slug: string }; googleConnected: boolean },
): Promise<WelcomeTourData> {
    const [rules, { data: extra }] = await Promise.all([
        loadReplyRulesSummary(supabase, input.business.id),
        supabase.from("businesses").select("category, website").eq("id", input.business.id).maybeSingle(),
    ]);
    const meta = input.user.user_metadata ?? {};
    const fullName = String(meta.first_name || meta.full_name || input.user.email?.split("@")[0] || "there");
    return {
        businessId: input.business.id,
        firstName: fullName.split(" ")[0],
        businessName: input.business.name || "Your business",
        reviewLink: reviewCaptureBaseUrl(input.business.slug),
        googleConnected: input.googleConnected,
        replyRules: rules.enabled ? summarizeReplyRules(rules.rules) : [],
        category: (extra as { category?: string | null } | null)?.category ?? null,
        website: (extra as { website?: string | null } | null)?.website ?? null,
    };
}
