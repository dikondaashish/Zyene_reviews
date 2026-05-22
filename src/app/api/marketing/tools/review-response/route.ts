import { NextResponse } from "next/server";
import {
    generatePrimaryReviewResponse,
    renderBonusTemplates,
} from "@/lib/phase7/review-response-templates";
import { captureToolLead } from "@/lib/phase7/capture-tool-lead";
import { sendEmail } from "@/services/resend/send-email";

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
        .map((b) => `<p style="font-size:14px;color:#52525b;"><strong>${b.label}</strong><br/>${b.text}</p>`)
        .join("");

    try {
        await sendEmail({
            to: email.toLowerCase(),
            subject: "5 more review response templates",
            html: `<p style="font-size:16px;color:#52525b;">Your draft reply:</p>
<blockquote style="border-left:3px solid #e4e4e7;padding-left:12px;color:#52525b;">${primary}</blockquote>
<h3 style="font-size:16px;color:#18181b;">5 bonus templates</h3>
${bonusHtml}
<p style="font-size:14px;color:#71717a;"><a href="https://zyenereviews.com/signup?utm_source=free_tool&utm_medium=review_response">Try AI replies in your brand voice</a> — 7-day free trial.</p>`,
        });
    } catch (err) {
        console.error("[tools/review-response] email failed:", err);
    }

    return NextResponse.json({ ok: true, response: primary, bonusSent: true });
}
