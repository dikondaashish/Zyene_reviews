import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { applyUnsubscribe, resolveUnsubscribeTarget } from "@/services/review-requests/email-unsubscribe";

export const dynamic = "force-dynamic";

function pageUrl(request: Request, params: Record<string, string>) {
    const target = new URL("/unsubscribe/review-requests", request.url);
    for (const [key, value] of Object.entries(params)) target.searchParams.set(key, value);
    return target;
}

/** GET never mutates (link scanners prefetch); it shows a confirm page. */
export async function GET(request: Request) {
    const url = new URL(request.url);
    return NextResponse.redirect(pageUrl(request, {
        ref: url.searchParams.get("ref") ?? "", sig: url.searchParams.get("sig") ?? "",
    }), 303);
}

/** Confirm-page form POST, or RFC 8058 one-click POST from the mail provider. */
export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const form = await request.formData();
        const oneClick = form.get("List-Unsubscribe") === "One-Click";
        const ref = oneClick ? url.searchParams.get("ref") : form.get("ref");
        const sig = oneClick ? url.searchParams.get("sig") : form.get("sig");
        const target = await resolveUnsubscribeTarget(ref, sig);
        if (!target) {
            return oneClick ? NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 })
                : NextResponse.redirect(pageUrl(request, { error: "invalid" }), 303);
        }
        await applyUnsubscribe(target, oneClick ? "one_click" : "link");
        return oneClick ? NextResponse.json({ unsubscribed: true })
            : NextResponse.redirect(pageUrl(request, { success: "1" }), 303);
    } catch (error) {
        logger.error({ err: error }, "[review-requests/unsubscribe] failed");
        return NextResponse.json({ error: "Unable to process unsubscribe request" }, { status: 500 });
    }
}
