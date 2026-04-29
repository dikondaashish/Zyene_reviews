/**
 * @deprecated **Do not use.** Replaced by `POST /api/webhooks/google/pubsub`, which enqueues
 * Inngest `review/sync.platform` (same path as cron) so review import stays in one pipeline.
 *
 * This route previously processed a single Google review inline. It is intentionally **neutralized**:
 * it always responds **200** and performs **no work**, so any Pub/Sub subscription still pointing here
 * will not double-sync with `/pubsub` and will not trigger retries from non-2xx responses.
 *
 * **Migration:** Point your Pub/Sub push subscription at:
 *   `${NEXT_PUBLIC_APP_URL}/api/webhooks/google/pubsub?token=${GOOGLE_PUBSUB_VERIFICATION_TOKEN}`
 * This file remains for backwards compatibility until all traffic has moved.
 */
import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = createLogger("webhook-google-gbp-reviews");

function successorPubSubWebhookUrl(): string {
    const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const path = "/api/webhooks/google/pubsub";
    return base ? `${base}${path}` : path;
}

function deprecationHeaders(): Record<string, string> {
    const successor = successorPubSubWebhookUrl();
    return {
        Deprecation: "true",
        Link: `<${successor}>; rel="successor-version"`,
    };
}

/**
 * Deprecated no-op. Acknowledges any caller (including stale Pub/Sub) with 200 and does nothing.
 */
export async function POST(req: NextRequest) {
    log.info(
        {
            route: "POST /api/webhooks/google/gbp-reviews",
            successor: successorPubSubWebhookUrl(),
            userAgent: req.headers.get("user-agent"),
        },
        "Deprecated GBP webhook invoked — no action taken; use /api/webhooks/google/pubsub"
    );

    return new NextResponse("OK", { status: 200, headers: deprecationHeaders() });
}
