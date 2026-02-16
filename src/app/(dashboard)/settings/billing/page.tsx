import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/stripe/plans";
import { BillingClient } from "@/components/settings/billing-client";

export default async function BillingPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get organization info
    const admin = createAdminClient();
    const { data: member } = await admin
        .from("organization_members")
        .select("organization_id, organizations(*)")
        .eq("user_id", user.id)
        .single();

    if (!member) {
        redirect("/dashboard");
    }

    const org = member.organizations as any;
    const currentPlanKey = org.plan || "free";
    const currentPlan = PLANS[currentPlanKey] || PLANS.free;

    // Get usage stats for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: businesses } = await admin
        .from("businesses")
        .select("id")
        .eq("organization_id", member.organization_id);

    const businessIds = businesses?.map((b: any) => b.id) || [];
    let reviewRequestsUsed = 0;
    let aiRepliesUsed = 0;

    if (businessIds.length > 0) {
        const { count: rrCount } = await admin
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .in("business_id", businessIds)
            .gte("created_at", startOfMonth.toISOString());

        reviewRequestsUsed = rrCount || 0;

        const { count: aiCount } = await admin
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .in("business_id", businessIds)
            .eq("response_status", "responded")
            .gte("responded_at", startOfMonth.toISOString());

        aiRepliesUsed = aiCount || 0;
    }

    return (
        <BillingClient
            currentPlanKey={currentPlanKey}
            currentPlan={currentPlan}
            planStatus={org.plan_status || "active"}
            hasStripeCustomer={!!org.stripe_customer_id}
            usage={{
                reviewRequests: {
                    used: reviewRequestsUsed,
                    max: org.max_review_requests_per_month || 10,
                },
                aiReplies: {
                    used: aiRepliesUsed,
                    max: org.max_ai_replies_per_month || 0,
                },
                businesses: {
                    used: businessIds.length,
                    max: org.max_businesses || 1,
                },
            }}
            plans={PLANS}
        />
    );
}
