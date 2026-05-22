import { NextResponse } from "next/server";
import { fetchPublicPlaceMetrics } from "@/lib/phase7/places-public";
import { captureToolLead } from "@/lib/phase7/capture-tool-lead";
import { sendEmail } from "@/services/resend/send-email";

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
            html: `<p style="font-size:16px;color:#52525b;">Here is your direct Google review link for <strong>${metrics.name}</strong>:</p>
<p style="font-size:16px;"><a href="${metrics.reviewLink}" style="color:#16a34a;">${metrics.reviewLink}</a></p>
<p style="font-size:14px;color:#71717a;">Share this link via SMS, email, or QR code. Customers tap once to leave a review on Google.</p>
<p style="font-size:14px;color:#71717a;">Want automated requests and AI replies? <a href="https://zyenereviews.com/signup?utm_source=free_tool&utm_medium=review_link">Start a 7-day free trial</a>.</p>`,
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
