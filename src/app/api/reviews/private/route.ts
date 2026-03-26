import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewAlert } from "@/lib/notifications/review-alert";
import { z } from "zod";

const privateFeedbackSchema = z.object({
    review_request_id: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    content: z.string().max(5000).optional().default(""),
    customer_email: z.string().email().optional().nullable(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = privateFeedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }
        const { review_request_id, rating, content, customer_email } = parsed.data;

        // Validation
        if (!review_request_id || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data: reviewRequest, error: requestErr } = await supabase
            .from("review_requests")
            .select("id, business_id")
            .eq("id", review_request_id)
            .maybeSingle();

        if (requestErr || !reviewRequest?.business_id) {
            return NextResponse.json({ error: "Invalid review request" }, { status: 404 });
        }
        const business_id = reviewRequest.business_id;

        // 1. Insert Private Feedback
        const { data: feedback, error } = await supabase
            .from("private_feedback")
            .insert({
                business_id,
                review_request_id,
                rating,
                content,
                customer_email: customer_email || null,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Failed to insert private feedback:", error);
            throw error;
        }

        // 2. Trigger Email Notification (mimicking a review object)
        sendReviewAlert({
            id: feedback.id, // Using feedback ID (won't affect reviews table updates)
            business_id: business_id,
            rating: rating,
            author_name: customer_email || "Anonymous Customer",
            text: `[PRIVATE FEEDBACK] ${content || "No details provided."}`,
            urgency_score: rating <= 2 ? 8 : 4 // Higher urgency for lower ratings
        }).catch(err => console.error("Failed to send private feedback alert:", err));

        return NextResponse.json({ success: true, feedback });

    } catch (error: any) {
        console.error("Private Feedback API Error:", error);
        return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }
}
