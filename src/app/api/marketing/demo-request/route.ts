import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { captureMarketingLead } from "@/lib/enterprise/capture-marketing-lead";
import { ENTERPRISE_SALES_EMAIL } from "@/lib/enterprise/enterprise-data";
import { sendEmail } from "@/services/resend/send-email";
import { emailMutedFooter } from "@/lib/email/transactional-email-styles";

export async function POST(request: Request) {
    let body: {
        email?: string;
        name?: string;
        company?: string;
        locations?: string;
        message?: string;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = body.email?.trim();
    const name = body.name?.trim() || "Unknown";
    const company = body.company?.trim() || "—";
    const locations = body.locations?.trim() || "—";
    const message = body.message?.trim() || "—";

    if (!email) {
        return NextResponse.json({ error: "Work email is required" }, { status: 400 });
    }

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
            html: `<p><strong>Demo / enterprise inquiry</strong></p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
<li><strong>Company:</strong> ${company}</li>
<li><strong>Locations:</strong> ${locations}</li>
</ul>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, "<br/>")}</p>
${emailMutedFooter("Submitted via zyenereviews.com/demo")}`,
            replyTo: email,
        });
        await sendEmail({
            to: email,
            subject: "We received your demo request — Zyene Reviews",
            html: `<p>Hi ${name},</p>
<p>Thanks for your interest in Zyene Reviews Enterprise. Our sales team will reach out within one business day to schedule a walkthrough.</p>
<p>— Zyene Reviews Sales</p>`,
        });
    } catch (err) {
        logger.error({ err: err }, "[demo-request] email failed:");
    }

    return NextResponse.json({ ok: true });
}
