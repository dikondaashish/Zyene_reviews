import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { clientIpFrom, publicFormRateLimit } from "@/lib/auth/rate-limit";
import { emailMutedFooter } from "@/lib/email/transactional-email-styles";
import { escapeHtml } from "@/lib/security/html-escape";
import { sendEmail } from "@/services/resend/send-email";

const CONTACT_INBOX = "contact@zyenereviews.com";

const SUBJECT_OPTIONS = ["General Inquiry", "Sales", "Support", "Partnership"] as const;

/**
 * Zod rather than the hand-rolled `if` chain this replaces, per AGENTS.md.
 * `.email()` matters beyond tidiness here: the address is echoed into `replyTo`
 * and used as a send target, so `includes("@")` was not a strong enough gate.
 */
const contactSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("A valid email is required").max(320),
    subject: z.enum(SUBJECT_OPTIONS),
    message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export async function handleContactPost(request: Request) {
    // Unauthenticated and it sends two real emails, one of them to an address the
    // caller supplies — without a limit that is a spam relay on our sending domain.
    // Fails CLOSED: if the limiter is unreachable we would rather drop a contact
    // form submission than leave the relay wide open.
    try {
        const { success } = await publicFormRateLimit.limit(clientIpFrom(request));
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again in a few minutes." },
                { status: 429 }
            );
        }
    } catch (err) {
        logger.error({ err }, "[contact] rate limit check failed");
        return NextResponse.json({ error: "Unable to send message. Please try again." }, { status: 503 });
    }

    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
            { status: 400 }
        );
    }
    const { name, email, subject, message } = parsed.data;

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
