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

        const baseInsert = {
            business_id: businessId,
            status: "clicked",
            sent_at: nowIso,
            delivered_at: nowIso,
            opened_at: nowIso,
            clicked_at: nowIso,
        };

        // Primary path for current schema: explicit link/public_link attribution.
        // Fallback path supports older production schemas where channel/trigger_source
        // CHECK constraints may not include these newer enum values yet.
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
