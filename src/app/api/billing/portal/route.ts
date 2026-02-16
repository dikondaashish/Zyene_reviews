import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
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

        if (!org.stripe_customer_id) {
            return NextResponse.json(
                { error: "No billing account found. Please subscribe to a plan first." },
                { status: 400 }
            );
        }

        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const dashboardUrl = rootDomain.includes("localhost")
            ? `http://${rootDomain}`
            : `http://dashboard.${rootDomain}`;

        const session = await stripe.billingPortal.sessions.create({
            customer: org.stripe_customer_id,
            return_url: `${dashboardUrl}/settings/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Portal Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create portal session" },
            { status: 500 }
        );
    }
}
