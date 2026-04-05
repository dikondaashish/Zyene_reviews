import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { requestRateLimit } from "@/lib/auth/rate-limit";
import { z } from "zod";

const importSchema = z.object({
    customers: z.array(z.object({
        first_name: z.string().max(100).optional(),
        last_name: z.string().max(100).optional(),
        email: z.string().email().max(255).optional(),
        phone: z.string().max(30).optional(),
    })).min(1, "At least one customer required").max(5000, "Maximum 5000 customers per import"),
    businessId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
    const supabase = await createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit: prevent import abuse
        const { success: rateLimitOk } = await requestRateLimit.limit(`import:${user.id}`);
        if (!rateLimitOk) {
            return NextResponse.json({ error: "Too many imports. Please wait." }, { status: 429 });
        }

        const body = await req.json();
        const parsed = importSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "Invalid import data" },
                { status: 400 }
            );
        }
        const { customers, businessId: requestedBusinessId } = parsed.data;

        // 1. Resolve business (explicit businessId takes precedence, then active business context)
        const activeCtx = await getActiveBusinessId();
        const resolvedBusinessId = requestedBusinessId || activeCtx.business?.id;
        if (!resolvedBusinessId) {
            return NextResponse.json(
                { error: "No active business found" },
                { status: 400 }
            );
        }
        const hasAccess = await userCanAccessBusiness(supabase, user.id, resolvedBusinessId);
        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const businessId = resolvedBusinessId;

        // 2. Prepare payload for insertion
        const insertPayload = customers.map((c) => ({
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

    } catch (error: unknown) {
        console.error("[Customers Import] Unexpected error:", error);
        Sentry.captureException(error);
        return NextResponse.json(
            { error: "An unexpected error occurred during import." },
            { status: 500 }
        );
    }
}
