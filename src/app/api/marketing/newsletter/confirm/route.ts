import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { confirmNewsletterSubscription } from "@/lib/marketing/newsletter-confirm";

function backToPage(request: Request, params: Record<string, string>) {
    const target = new URL("/newsletter/confirm", request.url);
    for (const [key, value] of Object.entries(params)) target.searchParams.set(key, value);
    return NextResponse.redirect(target, 303);
}

/**
 * Confirm is a POST from the button on /newsletter/confirm, never a GET: mail
 * security scanners open every link in a message, and a GET would confirm
 * addresses whose owners never asked for anything.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const outcome = await confirmNewsletterSubscription(formData.get("token"));
        if (outcome === "invalid") return backToPage(request, { error: "invalid" });
        return backToPage(request, { success: "1" });
    } catch (error: unknown) {
        logger.error({ err: error }, "[newsletter/confirm] failed");
        return backToPage(request, { error: "server" });
    }
}
