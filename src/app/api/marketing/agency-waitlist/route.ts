import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { captureMarketingLead } from "@/lib/enterprise/capture-marketing-lead";
import { PARTNER_CONTACT_EMAIL } from "@/lib/campaign-content/partnerships-data";
import { clientIpFrom, publicFormRateLimit } from "@/lib/auth/rate-limit";
import { formNotificationEmail } from "@/services/resend/templates/form-emails";
import { sendEmail } from "@/services/resend/send-email";

const waitlistSchema = z.object({
    email: z.string().trim().email("Email is required").max(320),
    agencyName: z.string().trim().max(200).optional(),
    clientCount: z.string().trim().max(100).optional(),
});

export async function POST(request: Request) {
    try {
        const { success } = await publicFormRateLimit.limit(clientIpFrom(request));
        if (!success) {
            return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
        }
    } catch (err) {
        logger.error({ err }, "[agency-waitlist] rate limit check failed");
        return NextResponse.json({ error: "Unable to submit right now." }, { status: 503 });
    }

    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = waitlistSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
            { status: 400 }
        );
    }
    const { email, agencyName, clientCount } = parsed.data;

    const lead = await captureMarketingLead({
        email,
        source: "agency_dashboard_waitlist",
    });
    if (!lead.ok) {
        return NextResponse.json({ error: lead.error }, { status: 400 });
    }

    try {
        await sendEmail({
            to: PARTNER_CONTACT_EMAIL,
            subject: `[Agency dashboard waitlist] ${agencyName || email}`,
            html: formNotificationEmail("Agency dashboard waitlist signup", { Email: email, Agency: agencyName || "Not provided", Clients: clientCount || "Not provided" }),
        });
    } catch (err) {
        logger.error({ err: err }, "[agency-waitlist] notify failed:");
    }

    return NextResponse.json({ ok: true });
}
