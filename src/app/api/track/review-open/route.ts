import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { recordReviewRequestOpenForRef } from "@/lib/review-requests/record-review-request-open";
import { z } from "zod";

const openSchema = z.object({
    businessId: z.string().uuid(),
    requestId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = openSchema.safeParse(body);
        if (!parsed.success) {
            console.error("[track/review-open] invalid payload", parsed.error.flatten());
            return NextResponse.json({ error: "Invalid open tracking payload" }, { status: 400 });
        }

        const { businessId, requestId } = parsed.data;

        if (requestId) {
            const result = await recordReviewRequestOpenForRef({ businessId, requestId });
            if (!result.ok) {
                if (result.reason === "not_found") {
                    return NextResponse.json({ error: "Review request not found" }, { status: 404 });
                }
                if (result.reason === "lookup_failed") {
                    return NextResponse.json({ error: "Review request lookup failed" }, { status: 500 });
                }
                return NextResponse.json({ error: "Failed to track open" }, { status: 500 });
            }
            return NextResponse.json({ success: true, requestId });
        }

        const nowIso = new Date().toISOString();
        const supabase = createAdminClient();

        console.info("[track/review-open] anonymous public_link (no ref)", { businessId });
        const baseInsert = {
            business_id: businessId,
            status: "clicked",
            sent_at: nowIso,
            delivered_at: nowIso,
            opened_at: nowIso,
            clicked_at: nowIso,
        };

        let createdRequest: { id: string } | null = null;
        let insertError: unknown = null;

        const primaryInsert = await supabase
            .from("review_requests")
            .insert({
                ...baseInsert,
                channel: "link",
                trigger_source: "public_link",
            })
            .select("id")
            .single();

        createdRequest = primaryInsert.data;
        insertError = primaryInsert.error;

        if (!createdRequest) {
            const fallbackInsert = await supabase
                .from("review_requests")
                .insert({
                    ...baseInsert,
                    channel: "email",
                    trigger_source: "manual",
                })
                .select("id")
                .single();

            createdRequest = fallbackInsert.data;
            insertError = fallbackInsert.error;
        }

        if (!createdRequest) {
            throw insertError ?? new Error("Failed to create request");
        }

        return NextResponse.json({ success: true, requestId: createdRequest.id });
    } catch (error: unknown) {
        console.error("Open tracking error:", error);
        return NextResponse.json({ error: "Failed to track open" }, { status: 500 });
    }
}
