import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getReview } from "@/services/google/business-profile";
import { getValidGoogleToken, processGoogleReview } from "@/services/google/sync-service";
import { extractGoogleLocationIdFromQaPayload, processQaWebhookForLocation } from "@/services/google/webhook-qa";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
    try {
        // Verify webhook secret via header only (never URL params — they leak in logs)
        const sharedSecret = process.env.GOOGLE_GBP_WEBHOOK_SECRET;
        if (!sharedSecret) {
            Sentry.captureMessage("GOOGLE_GBP_WEBHOOK_SECRET is not configured", "error");
            return NextResponse.json({ error: "Webhook not configured securely" }, { status: 500 });
        }
        const headerSecret = req.headers.get("x-webhook-secret");
        if (headerSecret !== sharedSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // 1. Verify Pub/Sub message structure
        if (!body.message || !body.message.data) {
            console.error("[GBP Webhook] Invalid Pub/Sub message structure:", body);
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        // 2. Decode base64 payload
        const payloadRaw = Buffer.from(body.message.data, "base64").toString("utf-8");
        const payload = JSON.parse(payloadRaw);

        console.log("[GBP Webhook] Received notification:", payload);

        // Reviews: new_review / updated_review. Phase 1+ also subscribes to Q&A and media; those are no-ops until Phase 2 handlers exist.
        const reviewInfo = payload.new_review || payload.updated_review;
        if (!reviewInfo) {
            const qaLoc = extractGoogleLocationIdFromQaPayload(payload as Record<string, unknown>);
            if (qaLoc) {
                try {
                    await processQaWebhookForLocation(qaLoc);
                    console.log("[GBP Webhook] Q&A notification processed for location", qaLoc);
                } catch (e) {
                    console.error("[GBP Webhook] Q&A sync failed:", e);
                    Sentry.captureException(e, { tags: { route: "webhook-gbp-qa" } });
                }
                return new NextResponse(null, { status: 204 });
            }

            const other =
                payload.new_question ||
                payload.updated_question ||
                payload.new_answer ||
                payload.updated_answer ||
                payload.new_customer_media;
            if (other) {
                console.log("[GBP Webhook] Non-review notification (no location parsed), ack");
            } else {
                console.log("[GBP Webhook] No review info in payload (not a review event)");
            }
            return new NextResponse(null, { status: 204 });
        }

        const { reviewName, locationName } = reviewInfo;
        if (!reviewName || !locationName) {
            console.error("[GBP Webhook] Missing reviewName or locationName in reviewInfo");
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Extract location ID (the last part of locationName: accounts/{acc}/locations/{loc})
        const googleLocationId = locationName.split("/").pop();
        if (!googleLocationId) {
            console.error("[GBP Webhook] Could not parse googleLocationId from:", locationName);
            return NextResponse.json({ error: "Invalid location format" }, { status: 400 });
        }

        const admin = createAdminClient();

        // 3. Find the platform associated with this Google Location ID
        // We use google_location_id stored in review_platforms
        const { data: platform, error: platformError } = await admin
            .from("review_platforms")
            .select("*")
            .eq("platform", "google")
            .eq("google_location_id", googleLocationId)
            .single();

        if (platformError || !platform) {
            console.error(`[GBP Webhook] Platform not found for location ${googleLocationId}:`, platformError);
            return NextResponse.json({ error: "Platform not found" }, { status: 404 });
        }

        // 4. Get valid OAuth token
        // This handles refreshing if expired
        const { accessToken } = await getValidGoogleToken(platform.id);

        // 5. Fetch the full review details from Google
        // Pub/Sub only gives the name, we need the rating/comment
        console.log(`[GBP Webhook] Fetching full review: ${reviewName}`);
        const googleReview = await getReview(accessToken!, reviewName);

        // 6. Process the review using the unified sync logic
        // This handles upserting to DB, AI analysis, and alerting
        const stats = await processGoogleReview(admin, platform, googleReview);

        console.log(`[GBP Webhook] Successfully processed review ${googleReview.reviewId}. Stats:`, stats);

        // Update platform last_synced_at timestamp
        await admin.from("review_platforms").update({
            last_synced_at: new Date().toISOString()
        }).eq("id", platform.id);

        return new NextResponse(null, { status: 204 });

    } catch (error: unknown) {
        console.error("[GBP Webhook] Unexpected error:", error);
        Sentry.captureException(error, { tags: { route: "webhook-gbp-reviews" } });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
