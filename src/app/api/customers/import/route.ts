import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";
import type { MemberOrgContext } from "@/lib/types/member-context";

export async function POST(req: Request) {
    const supabase = await createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { customers } = await req.json();

        if (!customers || !Array.isArray(customers) || customers.length === 0) {
            return NextResponse.json(
                { error: "No customers provided" },
                { status: 400 }
            );
        }

        // 1. Get user's active business ID
        const { data: member } = await supabase
            .from("organization_members")
            .select("organizations ( businesses ( id ) )")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();

        const memberTyped = member as unknown as MemberOrgContext;
        const businesses = memberTyped?.organizations?.businesses || [];
        const activeBusiness = businesses[0];

        if (!activeBusiness) {
            return NextResponse.json(
                { error: "No active business found" },
                { status: 400 }
            );
        }

        const businessId = activeBusiness.id;

        // 2. Prepare payload for insertion
        const insertPayload = customers.map((c: any) => ({
            business_id: businessId,
            first_name: c.first_name || null,
            last_name: c.last_name || null,
            email: c.email || null,
            phone: c.phone || null,
        })).filter(c => c.email || c.phone);

        if (insertPayload.length === 0) {
            return NextResponse.json(
                { error: "No valid customers found (requires email or phone)" },
                { status: 400 }
            );
        }

        // 3. Batch insert using Upsert to avoid duplicates if needed, or simply insert
        // Since we don't have constraints on unique email/phone per business yet, a simple insert is fine.
        // We'll insert in batches of 1000 MAX if list is huge

        let successCount = 0;
        const BATCH_SIZE = 500;

        for (let i = 0; i < insertPayload.length; i += BATCH_SIZE) {
            const batch = insertPayload.slice(i, i + BATCH_SIZE);
            const { error } = await supabase
                .from("customers")
                .insert(batch);

            if (error) {
                console.error("[Customers Import] Batch error:", error);
                Sentry.captureException(error);
                // We'll continue the other batches but record failure
            } else {
                successCount += batch.length;
            }
        }

        return NextResponse.json({
            success: true,
            imported: successCount,
            totalAttempted: insertPayload.length
        });

    } catch (error: any) {
        console.error("[Customers Import] Unexpected error:", error);
        Sentry.captureException(error);
        return NextResponse.json(
            { error: "An unexpected error occurred during import." },
            { status: 500 }
        );
    }
}
