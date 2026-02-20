import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { priceId } = await request.json();

        if (!priceId) {
            return NextResponse.json(
                { error: "priceId is required" },
                { status: 400 }
            );
        }

        // Get user's organization
        const admin = createAdminClient();
        const { data: member } = await admin
            .from("organization_members")
            .select("organization_id, organizations(*)")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json(
                { error: "No organization found" },
                { status: 404 }
            );
        }

        const org = member.organizations as any;
        let stripeCustomerId = org.stripe_customer_id;

        // Create Stripe customer if needed
        if (!stripeCustomerId) {
            // Fetch Organization Owner to use THEIR email for billing
            const { data: ownerMember } = await admin
                .from("organization_members")
                .select("user_id")
                .eq("organization_id", member.organization_id)
                .eq("role", "ORG_OWNER")
                .single();

            let billingEmail = user.email; // Default to current user if owner not found (fallback)
            let billingUserId = user.id;

            if (ownerMember) {
                // Fetch owner's email from public users table (or auth if possible via admin)
                const { data: ownerUser } = await admin
                    .from("users")
                    .select("email")
                    .eq("id", ownerMember.user_id)
                    .single();
                
                if (ownerUser && ownerUser.email) {
                    billingEmail = ownerUser.email;
                    billingUserId = ownerMember.user_id;
                }
            }

            console.log(`Creating Stripe Customer for Org ${org.name} with email ${billingEmail}`);

            const customer = await stripe.customers.create({
                email: billingEmail,
                name: org.name,
                metadata: {
                    organization_id: member.organization_id,
                    supabase_user_id: billingUserId,
                },
            });
            stripeCustomerId = customer.id;

            // Save Stripe customer ID
            await admin
                .from("organizations")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", member.organization_id);
        }

        // Create checkout session
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const dashboardUrl = rootDomain.includes("localhost")
            ? `http://${rootDomain}`
            : `http://dashboard.${rootDomain}`;

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${dashboardUrl}/settings/billing?success=true`,
            cancel_url: `${dashboardUrl}/settings/billing?canceled=true`,
            allow_promotion_codes: true,
            metadata: {
                organization_id: member.organization_id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
