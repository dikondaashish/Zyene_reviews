import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
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
            return NextResponse.json({ error: "Invalid open tracking payload" }, { status: 400 });
        }

        const { businessId, requestId } = parsed.data;
        const nowIso = new Date().toISOString();
        const supabase = createAdminClient();

        if (requestId) {
            const { data: existing, error: lookupError } = await supabase
                .from("review_requests")
                .select("id,status")
                .eq("id", requestId)
                .eq("business_id", businessId)
                .maybeSingle();

            if (lookupError || !existing) {
                return NextResponse.json({ error: "Review request not found" }, { status: 404 });
            }

            const terminalStatuses = new Set(["completed", "review_left", "feedback_left"]);
            const nextStatus = terminalStatuses.has(existing.status) ? existing.status : "clicked";

            const { error: updateError } = await supabase
                .from("review_requests")
                .update({
                    status: nextStatus,
                    opened_at: nowIso,
                    clicked_at: nowIso,
                })
                .eq("id", requestId);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true, requestId });
        }

        const { data: createdRequest, error: insertError } = await supabase
            .from("review_requests")
            .insert({
                business_id: businessId,
                channel: "link",
                trigger_source: "public_link",
                status: "clicked",
                sent_at: nowIso,
                delivered_at: nowIso,
                opened_at: nowIso,
                clicked_at: nowIso,
            })
            .select("id")
            .single();

        if (insertError || !createdRequest) {
            throw insertError ?? new Error("Failed to create request");
        }

        return NextResponse.json({ success: true, requestId: createdRequest.id });
    } catch (error: unknown) {
        console.error("Open tracking error:", error);
        return NextResponse.json({ error: "Failed to track open" }, { status: 500 });
    }
}
