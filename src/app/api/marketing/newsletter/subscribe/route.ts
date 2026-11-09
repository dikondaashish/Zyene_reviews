import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { processNewsletterSubscribe } from "@/lib/marketing/newsletter-subscribe";
import { clientIpFrom, publicNewsletterRateLimit } from "@/lib/auth/rate-limit";

type SubscribeBody = {
    email?: string;
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    /** Honeypot: hidden from people, so only a bot fills it. */
    website?: string;
};

export async function POST(request: Request) {
    const verification = await checkBotId();
    if (verification.isBot) {
        return NextResponse.json({ error: "Unable to subscribe. Please try again." }, { status: 403 });
    }

    try {
        const { success } = await publicNewsletterRateLimit.limit(clientIpFrom(request));
        if (!success) return NextResponse.json({ error: "Too many subscriptions" }, { status: 429 });
    } catch {
        return NextResponse.json({ error: "Subscription unavailable" }, { status: 503 });
    }

    let body: SubscribeBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Look successful so the bot moves on, but store and send nothing.
    if (body.website) return NextResponse.json({ ok: true, newLead: false });

    const result = await processNewsletterSubscribe({
        email: body.email ?? "",
        source: body.source,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
    });

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
        ok: true,
        newLead: result.newLead,
        ...(result.message ? { message: result.message } : {}),
    });
}
