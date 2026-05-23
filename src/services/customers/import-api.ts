import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { requestRateLimit } from "@/lib/auth/rate-limit";
import { customersImportSchema } from "./import-schema";

export async function handleCustomersImport(req: Request) {
    const supabase = await createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { success: rateLimitOk } = await requestRateLimit.limit(`import:${user.id}`);
        if (!rateLimitOk) {
            return NextResponse.json({ error: "Too many imports. Please wait." }, { status: 429 });
        }

        const body = await req.json();
        const parsed = customersImportSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "Invalid import data" },
                { status: 400 }
            );
        }
        const { customers, businessId: requestedBusinessId } = parsed.data;

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

        const insertPayload = customers.reduce<
            Array<{
                business_id: string;
                first_name: string | null;
                last_name: string | null;
                email: string | null;
                phone: string | null;
            }>
        >((acc, c) => {
            if (!c.email && !c.phone) return acc;
            acc.push({
                business_id: businessId,
                first_name: c.first_name || null,
                last_name: c.last_name || null,
                email: c.email || null,
                phone: c.phone || null,
            });
            return acc;
        }, []);

        if (insertPayload.length === 0) {
            return NextResponse.json(
                { error: "No valid customers found (requires email or phone)" },
                { status: 400 }
            );
        }

        let successCount = 0;
        const BATCH_SIZE = 500;

        const batchResults = await Promise.all(
            Array.from({ length: Math.ceil(insertPayload.length / BATCH_SIZE) }, (_, index) => {
                const batch = insertPayload.slice(index * BATCH_SIZE, index * BATCH_SIZE + BATCH_SIZE);
                return supabase.from("customers").insert(batch).then(({ error }) => ({ batch, error }));
            })
        );
        for (const { batch, error } of batchResults) {
            if (error) {
                logger.error({ err: error }, "[Customers Import] Batch error:");
                Sentry.captureException(error);
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
        logger.error({ err: error }, "[Customers Import] Unexpected error:");
        Sentry.captureException(error);
        return NextResponse.json(
            { error: "An unexpected error occurred during import." },
            { status: 500 }
        );
    }
}
