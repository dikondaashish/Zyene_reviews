import { NextResponse } from "next/server";
import { fetchPublicPlaceMetrics } from "@/lib/phase7/places-public";
import { captureToolLead } from "@/lib/phase7/capture-tool-lead";
import { sendEmail } from "@/services/resend/send-email";
import { reviewLinkEmailHtml } from "@/lib/email/transactional-email-styles";

export async function POST(request: Request) {
    let body: { email?: string; placeId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const placeId = body.placeId?.trim();
    if (!placeId) {
        return NextResponse.json({ error: "Select a business first" }, { status: 400 });
    }

    const metrics = await fetchPublicPlaceMetrics(placeId);
    if (!metrics) {
        return NextResponse.json({ error: "Could not load business details" }, { status: 404 });
    }

    const lead = await captureToolLead({
        email: body.email ?? "",
        source: "tool_review_link",
    });
    if (!lead.ok) {
        return NextResponse.json({ error: lead.error }, { status: 400 });
    }

    try {
        await sendEmail({
            to: body.email!.trim().toLowerCase(),
            subject: `Your Google review link for ${metrics.name}`,
            html: reviewLinkEmailHtml(metrics.name, metrics.reviewLink),
        });
    } catch (err) {
        console.error("[tools/review-link] email failed:", err);
    }

    return NextResponse.json({
        ok: true,
        reviewLink: metrics.reviewLink,
        businessName: metrics.name,
        preview: true,
    });
}
