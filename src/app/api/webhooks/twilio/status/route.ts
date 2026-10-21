import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { handleTwilioStatusCallback } from "@/services/webhooks/twilio-status";

export const dynamic = "force-dynamic";

/** Twilio delivery status callback for review-request SMS (set per message via statusCallback). */
export async function POST(request: Request) {
    try {
        return await handleTwilioStatusCallback(request);
    } catch (error) {
        logger.error({ err: error }, "[twilio-status] callback failed");
        // 500 makes Twilio retry; ledger updates are idempotent by rank.
        return new NextResponse("Error", { status: 500 });
    }
}
