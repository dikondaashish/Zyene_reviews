import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { fetchPublicPlaceMetrics } from "@/lib/phase7/places-public";
import { captureToolLead } from "@/lib/phase7/capture-tool-lead";
import { sendEmail } from "@/services/resend/send-email";
import { reputationScoreEmailHtml } from "@/lib/email/transactional-email-styles";

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
            html: reputationScoreEmailHtml(metrics),
        });
    } catch (err) {
        logger.error({ err: err }, "[tools/reputation-score] email failed:");
    }

    return NextResponse.json({ ok: true, preview, fullReport: true });
}
