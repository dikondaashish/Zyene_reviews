import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { type NextRequest, NextResponse } from "next/server";
import { requestRateLimit } from "@/lib/auth/rate-limit";
import * as Sentry from "@sentry/nextjs";
import { bulkActionSchema } from "./bulk-schema";
import { runBulkReviewRequestAction } from "./bulk-request-action";

export async function handleCustomersBulkPost(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { success: rateLimitOk } = await requestRateLimit.limit(`bulk:${user.id}`);
        if (!rateLimitOk) {
            return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
        }

        const body = await request.json();
        const parsed = bulkActionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request" }, { status: 400 });
        }
        const { ids, businessId, action, data: actionData } = parsed.data;

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        switch (action) {
            case "delete": {
                const { error: deleteError } = await supabase
                    .from("customers")
                    .delete()
                    .in("id", ids)
                    .eq("business_id", businessId);

                if (deleteError) throw deleteError;
                return NextResponse.json({ success: true, count: ids.length });
            }

            case "tag": {
                const { tags, mode } = actionData || {};
                if (!tags || !Array.isArray(tags)) {
                    return NextResponse.json({ error: "Tags are required for this action" }, { status: 400 });
                }

                if (mode === "add") {
                    const { error: tagError } = await supabase.rpc("bulk_add_customer_tags", {
                        customer_ids: ids,
                        new_tags: tags,
                    });
                    if (tagError) throw tagError;
                } else {
                    const { error: tagError } = await supabase.rpc("bulk_remove_customer_tags", {
                        customer_ids: ids,
                        tags_to_remove: tags,
                    });
                    if (tagError) throw tagError;
                }

                return NextResponse.json({ success: true });
            }

            case "request": {
                const result = await runBulkReviewRequestAction(supabase, businessId, ids);
                return NextResponse.json(result.body, { status: result.status });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: unknown) {
        logger.error({ err: error }, "Bulk API Error:");
        Sentry.captureException(error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
