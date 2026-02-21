import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/settings/billing-client";
import { checkLimit } from "@/lib/stripe/check-limits";
import { PLANS, getPlanByPriceId } from "@/lib/stripe/plans";

export default async function BillingPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's organization via membership
    const { data: memberData } = await supabase
        .from("organization_members")
        .select(`
            organizations (
                id,
                name,
                plan,
                stripe_customer_id,
                stripe_subscription_id,
                plan_status
            )
        `)
        .eq("user_id", user.id)
        .single();

    // @ts-ignore - Supabase types inference
    const org = (memberData?.organizations as any);

    if (!org) {
        return (
            <div className="p-4">
                No organization found. Please contact support.
            </div>
        );
    }

    // Get usage stats (per-channel)
    const [emailRequests, smsRequests, linkRequests, aiReplies, businesses] = await Promise.all([
        checkLimit(org.id, "email_requests"),
        checkLimit(org.id, "sms_requests"),
        checkLimit(org.id, "link_requests"),
        checkLimit(org.id, "ai_replies"),
        checkLimit(org.id, "businesses"),
    ]);

    // Determine current plan from Stripe subscription price ID or org.plan field
    const orgPlanId = org.plan || "free";
    const currentPlan = PLANS.find((p) => p.id === orgPlanId) || null;

    return (
        <BillingClient
            currentPlan={currentPlan}
            planStatus={org.plan_status || "active"}
            hasStripeCustomer={!!org.stripe_customer_id}
            usage={{
                emailRequests: { used: emailRequests.current, max: emailRequests.max },
                smsRequests: { used: smsRequests.current, max: smsRequests.max },
                linkRequests: { used: linkRequests.current, max: linkRequests.max },
                aiReplies: { used: aiReplies.current, max: aiReplies.max },
                businesses: { used: businesses.current, max: businesses.max },
            }}
            plans={PLANS}
        />
    );
}
