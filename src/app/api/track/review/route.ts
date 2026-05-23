import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { z } from "zod";

const updateSchema = z.object({
    action: z.literal("update"),
    requestId: z.string().uuid(),
    trackData: z
        .object({
            status: z.string().max(50).optional(),
            review_left: z.boolean().optional(),
            rating_given: z.number().int().min(1).max(5).optional(),
            tags_selected: z.array(z.string().max(80)).max(20).optional(),
            selected_staff: z.array(z.string().max(120)).max(100).optional(),
            ai_review_text: z.string().max(5000).optional(),
            completed_at: z.string().datetime().optional(),
        })
        .refine((obj) => Object.keys(obj).length > 0, "trackData cannot be empty"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid tracking payload" }, { status: 400 });
        }
        const { requestId, trackData } = parsed.data;

        // Admin client is safe here only after strict request-level validation.
        const supabase = createAdminClient();

        const { data: existing, error: lookupError } = await supabase
            .from("review_requests")
            .select("id")
            .eq("id", requestId)
            .maybeSingle();

        if (lookupError || !existing) {
            return NextResponse.json({ error: "Review request not found" }, { status: 404 });
        }

        const { error } = await supabase
            .from("review_requests")
            .update(trackData)
            .eq("id", requestId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        logger.error({ err: error }, "Tracking error:");
        return NextResponse.json({ error: "Failed to track review" }, { status: 500 });
    }
}
