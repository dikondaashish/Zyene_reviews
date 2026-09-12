import { z } from "zod";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import {
    generatePrimaryReviewResponse,
    renderBonusTemplates,
} from "@/lib/free-tools/review-response-templates";
import { captureToolLead } from "@/lib/free-tools/capture-tool-lead";
import { sendEmail } from "@/services/resend/send-email";
import {
    reviewResponseBonusEmailHtml,
    reviewResponseBonusItemHtml,
} from "@/lib/email/transactional-email-styles";

async function handleValidatedRequest(request: Request) {
    const parsed = z.object({
        rating: z.number().int().min(1).max(5),
        reviewText: z.string().max(10000).optional(),
        businessName: z.string().trim().max(200).optional(),
        email: z.string().trim().email().max(254).optional(),
        sendBonus: z.boolean().optional(),
    }).safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Enter a rating from 1 to 5 and valid text fields." }, { status: 400 });
    const body = parsed.data;
    const rating = body.rating;

    const businessName = body.businessName?.trim() || "our business";
    const reviewText = body.reviewText?.trim() || "";
    const primary = generatePrimaryReviewResponse({ rating, reviewText, businessName });

    if (!body.sendBonus) {
        return NextResponse.json({ ok: true, response: primary });
    }

    const email = body.email?.trim();
    if (!email) {
        return NextResponse.json({ error: "Email required for bonus templates" }, { status: 400 });
    }

    const lead = await captureToolLead({ email, source: "tool_review_response" });
    if (!lead.ok) {
        return NextResponse.json({ error: lead.error }, { status: 400 });
    }

    const bonus = renderBonusTemplates(businessName);
    const bonusHtml = bonus
        .map((b) => reviewResponseBonusItemHtml(b.label, b.text))
        .join("");

    try {
        const delivery = await sendEmail({
            to: email.toLowerCase(),
            subject: "5 more review response templates",
            html: reviewResponseBonusEmailHtml(primary, bonusHtml),
        });
        return NextResponse.json({ ok: true, response: primary, bonusSent: delivery.sent });
    } catch (err) {
        logger.error({ err: err }, "[tools/review-response] email failed:");
    }

    return NextResponse.json({ ok: true, response: primary, bonusSent: false });
}

export async function POST(request: Request) {
    try { return await handleValidatedRequest(request); }
    catch { return NextResponse.json({ error: "The request could not be completed. Try again." }, { status: 503 }); }
}
