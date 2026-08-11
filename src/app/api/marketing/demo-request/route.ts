import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { captureMarketingLead } from "@/lib/enterprise/capture-marketing-lead";
import { ENTERPRISE_SALES_EMAIL } from "@/lib/enterprise/enterprise-data";
import { clientIpFrom, publicFormRateLimit } from "@/lib/auth/rate-limit";
import { escapeHtml } from "@/lib/security/html-escape";
import { sendEmail } from "@/services/resend/send-email";
import { emailMutedFooter } from "@/lib/email/transactional-email-styles";

const demoRequestSchema = z.object({
    email: z.string().trim().email("Work email is required").max(320),
    name: z.string().trim().max(200).optional(),
    company: z.string().trim().max(200).optional(),
    locations: z.string().trim().max(100).optional(),
    message: z.string().trim().max(5000).optional(),
});

export async function POST(request: Request) {
    // Unauthenticated, sends mail to our sales inbox AND to the caller-supplied
    // address. Fails closed so a limiter outage cannot reopen the relay.
    try {
        const { success } = await publicFormRateLimit.limit(clientIpFrom(request));
        if (!success) {
            return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
        }
    } catch (err) {
        logger.error({ err }, "[demo-request] rate limit check failed");
        return NextResponse.json({ error: "Unable to submit right now." }, { status: 503 });
    }

    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = demoRequestSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
            { status: 400 }
        );
    }

    const email = parsed.data.email;
    const name = parsed.data.name || "Unknown";
    const company = parsed.data.company || "—";
    const locations = parsed.data.locations || "—";
    const message = parsed.data.message || "—";

    const lead = await captureMarketingLead({
        email,
        source: "demo_request",
        metadata: { company, locations },
    });
    if (!lead.ok) {
        return NextResponse.json({ error: lead.error }, { status: 400 });
    }

    const salesInbox = process.env.DEMO_INBOUND_EMAIL?.trim() || ENTERPRISE_SALES_EMAIL;

    try {
        await sendEmail({
            to: salesInbox,
            subject: `[Demo request] ${company} — ${name}`,
            // Escaped: these land in our own sales inbox, and an email client
            // renders whatever markup an anonymous submitter put in them.
            html: `<p><strong>Demo / enterprise inquiry</strong></p>
<ul>
<li><strong>Name:</strong> ${escapeHtml(name)}</li>
<li><strong>Email:</strong> ${escapeHtml(email)}</li>
<li><strong>Company:</strong> ${escapeHtml(company)}</li>
<li><strong>Locations:</strong> ${escapeHtml(locations)}</li>
</ul>
<p><strong>Message:</strong></p>
<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
${emailMutedFooter("Submitted via zyenereviews.com/demo")}`,
            replyTo: email,
        });
        await sendEmail({
            to: email,
            subject: "We received your demo request — Zyene Reviews",
            html: `<p>Hi ${escapeHtml(name)},</p>
<p>Thanks for your interest in Zyene Reviews Enterprise. Our sales team will reach out within one business day to schedule a walkthrough.</p>
<p>— Zyene Reviews Sales</p>`,
        });
    } catch (err) {
        logger.error({ err: err }, "[demo-request] email failed:");
    }

    return NextResponse.json({ ok: true });
}
