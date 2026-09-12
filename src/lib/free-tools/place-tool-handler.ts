import { z } from "zod";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { fetchPublicPlaceMetrics } from "@/lib/free-tools/places-public";
import { captureToolLead } from "@/lib/free-tools/capture-tool-lead";
import { sendEmail } from "@/services/resend/send-email";
import { reputationScoreEmailHtml, reviewLinkEmailHtml } from "@/lib/email/transactional-email-styles";

const inputSchema = z.object({
    placeId: z.string().trim().min(1).max(256).regex(/^(?:places\/)?[A-Za-z0-9_-]+$/),
    email: z.string().trim().max(254).email().or(z.literal("")).optional(),
});

export async function handlePlaceTool(request: Request, kind: "review-link" | "reputation-score") {
    const input = inputSchema.safeParse(await request.json().catch(() => null));
    if (!input.success) return NextResponse.json({ error: "Select a business and enter a valid email, or leave email blank." }, { status: 400 });
    try {
        const metrics = await fetchPublicPlaceMetrics(input.data.placeId);
        if (!metrics) return NextResponse.json({ error: "Could not load business details. Try again." }, { status: 404 });
        const preview = { name: metrics.name, averageRating: metrics.averageRating, totalReviews: metrics.totalReviews };
        let emailSent = false;
        if (input.data.email) {
            try {
                const email = input.data.email.toLowerCase();
                const lead = await captureToolLead({ email, source: kind === "review-link" ? "tool_review_link" : "tool_reputation_score" });
                if (lead.ok) {
                    const delivery = await sendEmail({
                        to: email,
                        subject: kind === "review-link" ? `Your Google review link for ${metrics.name}` : `Reputation snapshot: ${metrics.name}`,
                        html: kind === "review-link" ? reviewLinkEmailHtml(metrics.name, metrics.reviewLink) : reputationScoreEmailHtml(metrics),
                    });
                    emailSent = delivery.sent;
                }
            } catch (err) { logger.error({ err, kind }, "Optional tool email failed"); }
        }
        return NextResponse.json({ ok: true, preview, reviewLink: metrics.reviewLink, businessName: metrics.name,
            emailSent, fullReport: emailSent,
            emailWarning: input.data.email && !emailSent ? "Your result is ready, but the email could not be sent. Copy the result below." : undefined });
    } catch (err) {
        logger.error({ err, kind }, "Public business tool failed");
        return NextResponse.json({ error: "Could not load your result. Please try again." }, { status: 503 });
    }
}
