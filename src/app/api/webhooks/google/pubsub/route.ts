/**
 * **Canonical** Google Pub/Sub HTTP push handler for GBP review notifications.
 * Enqueues Inngest `review/sync.platform` (same event as cron). The legacy route
 * `POST /api/webhooks/google/gbp-reviews` is deprecated and intentionally a no-op.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { createLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = createLogger("webhook-google-pubsub");

function trimEnv(value: string | undefined | null): string {
    return (value ?? "").trim();
}

/** Extract `locations/{id}` segment tail from a full resource name. */
function googleLocationIdFromLocationField(location: string): string | null {
    const parts = location.split("/").filter(Boolean);
    const idx = parts.lastIndexOf("locations");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return null;
}

type PubSubPushBody = {
    message?: {
        data?: string;
        messageId?: string;
        publishTime?: string;
    };
    subscription?: string;
};

function parseReviewLocationFromPayload(payload: Record<string, unknown>): {
    kind: "review";
    googleLocationId: string;
    /** For logs only */
    notificationLabel: string;
} | { kind: "skip"; reason: string } {
    const t = payload.type;
    if (t === "NEW_REVIEW" || t === "UPDATED_REVIEW") {
        const loc = payload.location;
        if (typeof loc !== "string" || !loc.trim()) {
            return { kind: "skip", reason: "review_missing_location" };
        }
        const googleLocationId = googleLocationIdFromLocationField(loc);
        if (!googleLocationId) {
            return { kind: "skip", reason: "review_location_unparseable" };
        }
        return { kind: "review", googleLocationId, notificationLabel: String(t) };
    }

    // Real GBP Pub/Sub JSON often uses `new_review` / `updated_review` blocks (see gbp-reviews webhook).
    const nr = payload.new_review;
    if (nr && typeof nr === "object") {
        const locationName = (nr as { locationName?: unknown }).locationName;
        if (typeof locationName !== "string" || !locationName.trim()) {
            return { kind: "skip", reason: "new_review_missing_locationName" };
        }
        const googleLocationId = googleLocationIdFromLocationField(locationName);
        if (!googleLocationId) {
            return { kind: "skip", reason: "new_review_location_unparseable" };
        }
        return { kind: "review", googleLocationId, notificationLabel: "new_review" };
    }

    const ur = payload.updated_review;
    if (ur && typeof ur === "object") {
        const locationName = (ur as { locationName?: unknown }).locationName;
        if (typeof locationName !== "string" || !locationName.trim()) {
            return { kind: "skip", reason: "updated_review_missing_locationName" };
        }
        const googleLocationId = googleLocationIdFromLocationField(locationName);
        if (!googleLocationId) {
            return { kind: "skip", reason: "updated_review_location_unparseable" };
        }
        return { kind: "review", googleLocationId, notificationLabel: "updated_review" };
    }

    return { kind: "skip", reason: "not_review_notification" };
}

/**
 * Google Pub/Sub HTTP push → enqueue the same Inngest job as cron (`review/sync.platform`).
 * Soft failures return 200 so Pub/Sub does not retry indefinitely.
 */
export async function POST(request: NextRequest) {
    const expectedToken = trimEnv(process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN);
    if (!expectedToken) {
        log.error("GOOGLE_PUBSUB_VERIFICATION_TOKEN is not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const url = new URL(request.url);
    const token = trimEnv(url.searchParams.get("token"));
    if (!token || token !== expectedToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch (err) {
        log.warn({ err }, "Pub/Sub webhook invalid JSON body");
        return new NextResponse("OK", { status: 200 });
    }

    const envelope = body as PubSubPushBody;
    const messageId = trimEnv(envelope.message?.messageId) || "unknown";

    log.info(
        {
            messageId,
            subscription: envelope.subscription,
            hasData: Boolean(envelope.message?.data),
        },
        "Pub/Sub webhook received"
    );

    if (!envelope.message?.data) {
        log.warn({ messageId, reason: "missing_message_data" }, "Pub/Sub webhook malformed envelope");
        return new NextResponse("OK", { status: 200 });
    }

    let payload: Record<string, unknown>;
    try {
        const raw = Buffer.from(envelope.message.data, "base64").toString("utf8");
        payload = JSON.parse(raw) as Record<string, unknown>;
    } catch (err) {
        log.warn({ err, messageId }, "Pub/Sub webhook failed to decode or parse message data");
        return new NextResponse("OK", { status: 200 });
    }

    const parsed = parseReviewLocationFromPayload(payload);
    if (parsed.kind === "skip") {
        log.info(
            { messageId, reason: parsed.reason, payloadKeys: Object.keys(payload) },
            "Pub/Sub webhook ignored notification"
        );
        return new NextResponse("OK", { status: 200 });
    }

    const { googleLocationId, notificationLabel } = parsed;

    log.info(
        { messageId, notificationType: notificationLabel, googleLocationId },
        "Pub/Sub webhook parsed review notification"
    );

    const admin = createAdminClient();
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("id")
        .eq("platform", "google")
        .eq("google_location_id", googleLocationId)
        .maybeSingle();

    if (platformError) {
        log.warn({ err: platformError, messageId, googleLocationId }, "Pub/Sub webhook platform lookup error");
        return new NextResponse("OK", { status: 200 });
    }

    if (!platform) {
        log.warn({ messageId, googleLocationId }, "Pub/Sub webhook no connected platform for location");
        return new NextResponse("OK", { status: 200 });
    }

    const eventId = `pubsub-review-${googleLocationId}-${messageId}`;

    await inngest.send({
        id: eventId,
        name: "review/sync.platform",
        data: {
            platformId: platform.id,
            platformType: "google",
            googleLocationId,
        },
    });

    log.info(
        {
            messageId,
            googleLocationId,
            platformId: platform.id,
            inngestEventId: eventId,
        },
        "Pub/Sub webhook enqueued review/sync.platform"
    );

    return new NextResponse("OK", { status: 200 });
}
