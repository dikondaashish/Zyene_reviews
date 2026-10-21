import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { terminateReviewRequestDrip } from "@/lib/campaigns/terminate-drip";
import { verifyReviewTracking } from "@/lib/review-requests/tracking-token";
import { z } from "zod";

const updateSchema = z.object({
    action: z.literal("update"),
    requestId: z.string().uuid(),
    businessId: z.string().uuid(),
    token: z.string().min(1),
    trackData: z
        .object({
            status: z.enum(["rated_positive", "rated_negative", "completed", "feedback_left"]).optional(),
            // Public clients cannot attest that Google published a review.
            rating_given: z.number().int().min(1).max(5).optional(),
            tags_selected: z.array(z.string().max(80)).max(20).optional(),
            selected_staff: z.array(z.string().max(120)).max(100).optional(),
            ai_review_text: z.string().max(5000).optional(),
            completed_at: z.string().datetime().optional(),
        })
        .refine((obj) => Object.keys(obj).length > 0, "trackData cannot be empty"),
});

const STATUS_RANK: Record<string, number> = {
    rated_positive: 1, rated_negative: 1, completed: 2, feedback_left: 2, review_left: 3,
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid tracking payload" }, { status: 400 });
        }
        const { requestId, businessId, token, trackData } = parsed.data;

        if (!verifyReviewTracking(requestId, businessId, token)) {
            return NextResponse.json({ error: "Invalid tracking token" }, { status: 403 });
        }

        const supabase = createAdminClient();

        const { data: existing, error: lookupError } = await supabase
            .from("review_requests")
            .select("id, status, campaign_id")
            .eq("id", requestId)
            .eq("business_id", businessId)
            .maybeSingle();

        if (lookupError || !existing) {
            return NextResponse.json({ error: "Review request not found" }, { status: 404 });
        }

        // Statuses only move forward (rated -> finished). Finishing the page means the customer
        // was handed off to Google or left private feedback; it is not proof a review was posted.
        const { completed_at: _clientTime, status, ...facts } = trackData;
        void _clientTime;
        const advance = status && STATUS_RANK[status] > (STATUS_RANK[existing.status] ?? 0);
        const finished = status === "completed" || status === "feedback_left";
        const { error } = await supabase
            .from("review_requests")
            .update({
                ...facts,
                ...(advance ? { status } : {}),
                ...(finished ? { completed_at: new Date().toISOString() } : {}),
            })
            .eq("id", requestId)
            .eq("business_id", businessId);

        if (error) {
            throw error;
        }

        if (finished) {
            await terminateReviewRequestDrip(supabase, requestId, "clicked");
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        logger.error({ err: error }, "Tracking error:");
        return NextResponse.json({ error: "Failed to track review" }, { status: 500 });
    }
}
