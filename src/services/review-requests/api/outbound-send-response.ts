import { NextResponse } from "next/server";
import type { SendOutboundReviewRequestResult } from "@/lib/review-requests/send-outbound";

/**
 * HTTP body for a programmatic send (`POST /api/v1/requests/send`, `POST /api/webhooks/generic`).
 *
 * A guard skip (asked within the frequency cap, opted out, STOP, unsubscribed, test contact) is
 * the expected outcome for a repeat customer, not a failure: it answers 200 with
 * `status: "skipped"`. Zapier treats any 4xx as a failed run, emails "Possible error on your
 * Zap" alerts and can turn the Zap off, so skips must not be sent as errors.
 */
export function outboundSendResponse(result: SendOutboundReviewRequestResult): NextResponse {
    if (result.success) {
        return NextResponse.json({
            success: true,
            data: {
                requestId: result.requestId,
                status: result.status,
                channel: result.channel,
                reviewLink: result.reviewLink,
                /** Set when one leg of `both` failed but the request is still considered sent. */
                warning: result.errorMessage,
            },
        });
    }
    if (result.skipped) {
        return NextResponse.json({
            success: true,
            data: {
                requestId: result.requestId,
                status: "skipped",
                channel: result.channel,
                reason: "not_eligible",
                message: result.errorMessage,
            },
        });
    }
    return NextResponse.json({ success: false, error: result.errorMessage }, { status: result.code });
}
