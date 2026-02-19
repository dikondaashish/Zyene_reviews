import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/settings/billing-client";
import { checkLimit } from "@/lib/stripe/check-limits";
import { PLANS, type Plan } from "@/lib/stripe/plans";

export default async function BillingPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's organizations
    const { data: members } = await supabase
        .from("organization_members")
        .select(`
            organizations (
                id,
                name,
                plan,
                stripe_customer_id,
                stripe_subscription_id,
                subscription_status
            )
        `)
        .eq("user_id", user.id);

    // Default to the first organization for now
    // In a real multi-org app, this would come from a cookie or URL param
    const member = members?.[0];
    const rawOrg = member?.organizations;
    const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;

    if (!org) {
        // Handle case where user has no organization (shouldn't happen due to onboarding)
        return (
            <div className="p-4">
                No organization found. Please contact support.
            </div>
        );
    }

    // Get usage stats
    const [reviewRequests, aiReplies, businesses] = await Promise.all([
        checkLimit(org.id, "review_requests"),
        checkLimit(org.id, "ai_replies"),
        checkLimit(org.id, "businesses"),
    ]);

    // Determine current plan details
    const currentPlanKey = org.plan || "free";
    const currentPlan = PLANS[currentPlanKey] || PLANS.free;

    return (
        <BillingClient
            currentPlanKey={currentPlanKey}
            currentPlan={currentPlan}
            planStatus={org.subscription_status || "active"}
            hasStripeCustomer={!!org.stripe_customer_id}
            usage={{
                reviewRequests: { used: reviewRequests.current, max: reviewRequests.max },
                aiReplies: { used: aiReplies.current, max: aiReplies.max },
                businesses: { used: businesses.current, max: businesses.max },
            }}
            plans={PLANS}
        />
    );
}
