import { NextResponse } from "next/server";
import { processNewsletterSubscribe } from "@/lib/marketing/newsletter-subscribe";
import { clientIpFrom, publicNewsletterRateLimit } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
    try {
        const { success } = await publicNewsletterRateLimit.limit(clientIpFrom(request));
        if (!success) return NextResponse.json({ error: "Too many subscriptions" }, { status: 429 });
    } catch {
        return NextResponse.json({ error: "Subscription unavailable" }, { status: 503 });
    }

    let body: {
        email?: string;
        source?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

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
