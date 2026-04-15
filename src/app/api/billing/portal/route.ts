import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { stripe } from "@/services/stripe/client";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";

export async function POST() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        interface OrgMemberWithRole {
            role: string;
            organizations: {
                id: string;
                stripe_customer_id: string | null;
            } | null;
        }

        // Get user's organization
        const admin = createAdminClient();
        const { data: member } = await admin
            .from("organization_members")
            .select("organization_id, role, organizations(*)")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json(
                { error: "No organization found" },
                { status: 404 }
            );
        }

        // Security: Only organization owners can manage billing
        const memberTyped = member as unknown as OrgMemberWithRole;
        const memberRole = memberTyped.role || "";
        if (!isOrganizationOwnerRole(memberRole)) {
            return NextResponse.json(
                { error: "You don't have permission to manage billing. Contact your organization owner." },
                { status: 403 }
            );
        }

        const org = memberTyped.organizations;
        if (!org) {
            return NextResponse.json({ error: "Organization lookup failed" }, { status: 404 });
        }

        if (!org.stripe_customer_id) {
            return NextResponse.json(
                { error: "No billing account found. Please subscribe to a plan first." },
                { status: 400 }
            );
        }

        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const dashboardUrl = rootDomain.includes("localhost")
            ? `http://${rootDomain}`
            : `https://app.${rootDomain}`;

        // Verify the Stripe customer exists before creating portal session
        try {
            await stripe.customers.retrieve(org.stripe_customer_id);
        } catch (custError: unknown) {
            const stripeErrorCode =
                typeof custError === "object" && custError !== null && "code" in custError
                    ? (custError as { code?: string }).code
                    : undefined;

            if (stripeErrorCode === "resource_missing") {
                // Stale customer ID — clear it from DB
                console.warn(`Stale Stripe customer ID ${org.stripe_customer_id} for org ${member.organization_id}, clearing...`);
                await admin
                    .from("organizations")
                    .update({ stripe_customer_id: null, stripe_subscription_id: null })
                    .eq("id", member.organization_id);

                return NextResponse.json(
                    { error: "Your billing account needs to be set up. Please subscribe to a plan first." },
                    { status: 400 }
                );
            }
            throw custError; // Re-throw other errors
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: org.stripe_customer_id,
            return_url: `${dashboardUrl}/settings/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error("Portal Error:", error);
        Sentry.captureException(error, { tags: { route: "billing-portal" } });
        return NextResponse.json(
            { error: "Failed to open billing portal. Please try again." },
            { status: 500 }
        );
    }
}
