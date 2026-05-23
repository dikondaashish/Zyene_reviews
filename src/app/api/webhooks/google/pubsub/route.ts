/**
 * **Canonical** Google Pub/Sub HTTP push handler for GBP review notifications.
 * Enqueues Inngest `review/sync.platform` (same event as cron).
 */
import { type NextRequest } from "next/server";
import { handleGooglePubsubPost } from "@/services/webhooks/google-pubsub-handler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    return handleGooglePubsubPost(request);
}
