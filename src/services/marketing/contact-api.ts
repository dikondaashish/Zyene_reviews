import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { clientIpFrom, contactReceiptRateLimit, publicFormRateLimit } from "@/lib/auth/rate-limit";
import { formBotSignalFields, formBotVerdict } from "@/lib/security/form-bot-signals";
import { formNotificationEmail, formReceiptEmail } from "@/services/resend/templates/form-emails";
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
    ...formBotSignalFields,
});

/**
 * The receipt goes to an address nobody has verified, so anyone can aim it at a
 * stranger. One per address per day keeps a real visitor's confirmation while
 * making the form useless for mail-bombing. Fails closed (no receipt): the team
 * notification already went out, so nothing is lost but a courtesy email.
 */
async function mayReceiveReceipt(email: string): Promise<boolean> {
    try {
        return (await contactReceiptRateLimit.limit(email.toLowerCase())).success;
    } catch (err) {
        logger.error({ err }, "[contact] receipt limit check failed");
        return false;
    }
}

export async function handleContactPost(request: Request) {
    // Unauthenticated and it sends two real emails, one of them to an address the
    // caller supplies - without a limit that is a spam relay on our sending domain.
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

    // Bot checks run before any send, so a rejected submission triggers neither
    // the team notification nor the receipt to the address it supplied.
    const verdict = formBotVerdict(parsed.data);
    if (verdict === "no_timing") {
        return NextResponse.json(
            { error: "Please refresh the page and try again." },
            { status: 400 }
        );
    }
    if (verdict !== "human") {
        // Look successful so the bot moves on instead of adapting.
        logger.info({ verdict, ip: clientIpFrom(request) }, "[contact] dropped automated submission");
        return NextResponse.json({ ok: true });
    }

    try {
        await sendEmail({
            stream: "forms",
            to: CONTACT_INBOX,
            subject: `[Contact] ${subject} - ${name}`,
            html: formNotificationEmail("New contact form submission", { Name: name, Email: email, Subject: subject }, message, "Submitted via zyenereviews.com/contact"),
            replyTo: email,
        });

        if (await mayReceiveReceipt(email)) {
            await sendEmail({
                stream: "forms",
                to: email,
                subject: "We received your message - Zyene Reviews",
                html: formReceiptEmail("contact", name, subject),
            });
        }
    } catch (err) {
        logger.error({ err }, "[contact] email failed:");
        return NextResponse.json({ error: "Unable to send message. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
