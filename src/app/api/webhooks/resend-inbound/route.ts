import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { handleResendInbound } from "@/services/webhooks/resend-inbound";

export const dynamic = "force-dynamic";

/** Resend inbound email (invoice-copy enrollment). Configure with RESEND_INBOUND_WEBHOOK_SECRET. */
export async function POST(request: Request) {
    try {
        return await handleResendInbound(request);
    } catch (error) {
        logger.error({ err: error }, "[resend-inbound] failed");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
