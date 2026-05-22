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

    const preview = {
        name: metrics.name,
        averageRating: metrics.averageRating,
        totalReviews: metrics.totalReviews,
        estimatedResponseRatePct: metrics.estimatedResponseRatePct,
    };

    const email = body.email?.trim();
    if (!email) {
        return NextResponse.json({ ok: true, preview, fullReport: false });
    }

    const lead = await captureToolLead({ email, source: "tool_reputation_score" });
    if (!lead.ok) {
        return NextResponse.json({ error: lead.error }, { status: 400 });
    }

    try {
        await sendEmail({
            to: email.toLowerCase(),
            subject: `Reputation snapshot: ${metrics.name}`,
            html: `<h2 style="font-size:20px;color:#18181b;">${metrics.name}</h2>
<ul style="font-size:16px;color:#52525b;line-height:1.8;">
<li><strong>Google rating:</strong> ${metrics.averageRating.toFixed(1)} / 5</li>
<li><strong>Review count:</strong> ${metrics.totalReviews}</li>
<li><strong>Estimated response rate:</strong> ~${metrics.estimatedResponseRatePct}% (public-data estimate)</li>
</ul>
<p style="font-size:14px;color:#71717a;">Track competitors, automate requests, and reply with AI in Zyene Reviews — <a href="https://zyenereviews.com/signup?utm_source=free_tool&utm_medium=reputation_score">free 7-day trial</a>.</p>`,
        });
    } catch (err) {
        console.error("[tools/reputation-score] email failed:", err);
    }

    return NextResponse.json({ ok: true, preview, fullReport: true });
}
