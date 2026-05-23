import { NextResponse } from "next/server";
import {
    generatePrimaryReviewResponse,
    renderBonusTemplates,
} from "@/lib/phase7/review-response-templates";
import { captureToolLead } from "@/lib/phase7/capture-tool-lead";
import { sendEmail } from "@/services/resend/send-email";
import {
    reviewResponseBonusEmailHtml,
    reviewResponseBonusItemHtml,
} from "@/lib/email/transactional-email-styles";

export async function POST(request: Request) {
    let body: {
        email?: string;
        rating?: number;
        reviewText?: string;
        businessName?: string;
        sendBonus?: boolean;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

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
        await sendEmail({
            to: email.toLowerCase(),
            subject: "5 more review response templates",
            html: reviewResponseBonusEmailHtml(primary, bonusHtml),
        });
    } catch (err) {
        console.error("[tools/review-response] email failed:", err);
    }

    return NextResponse.json({ ok: true, response: primary, bonusSent: true });
}
