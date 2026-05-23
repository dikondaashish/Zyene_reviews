import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { sendEmail } from "@/services/resend/send-email";
import { emailMutedFooter } from "@/lib/email/transactional-email-styles";

const CONTACT_INBOX = "contact@zyenereviews.com";

const SUBJECT_OPTIONS = new Set([
    "General Inquiry",
    "Sales",
    "Support",
    "Partnership",
]);

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
    let body: {
        name?: string;
        email?: string;
        subject?: string;
        message?: string;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const subject = body.subject?.trim() || "";
    const message = body.message?.trim() || "";

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!SUBJECT_OPTIONS.has(subject)) {
        return NextResponse.json({ error: "Please select a valid subject" }, { status: 400 });
    }
    if (!message || message.length < 10) {
        return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }
    if (message.length > 5000) {
        return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    try {
        await sendEmail({
            to: CONTACT_INBOX,
            subject: `[Contact] ${subject} — ${name}`,
            html: `<p><strong>New contact form submission</strong></p>
<ul>
<li><strong>Name:</strong> ${escapeHtml(name)}</li>
<li><strong>Email:</strong> ${escapeHtml(email)}</li>
<li><strong>Subject:</strong> ${escapeHtml(subject)}</li>
</ul>
<p><strong>Message:</strong></p>
<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
${emailMutedFooter("Submitted via zyenereviews.com/contact")}`,
            replyTo: email,
        });

        await sendEmail({
            to: email,
            subject: "We received your message — Zyene Reviews",
            html: `<p>Hi ${escapeHtml(name)},</p>
<p>Thanks for reaching out. We received your message about <strong>${escapeHtml(subject)}</strong> and will reply within one business day.</p>
<p>— Zyene Reviews</p>`,
        });
    } catch (err) {
        logger.error({ err }, "[contact] email failed:");
        return NextResponse.json({ error: "Unable to send message. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
