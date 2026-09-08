import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { clientIpFrom, publicFormRateLimit } from "@/lib/auth/rate-limit";
import { captureBookLead } from "@/lib/marketing/book-lead";

const bookLeadSchema = z.object({
    email: z.string().trim().email("A valid email is required").max(320),
    industry: z.string().trim().max(80).optional(),
    goal: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
    if (process.env.NODE_ENV === "production") {
        try {
            const { success } = await publicFormRateLimit.limit(clientIpFrom(request));
            if (!success) {
                return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
            }
        } catch (err) {
            logger.error({ err }, "[book-lead] rate limit check failed");
            return NextResponse.json({ error: "Unable to submit right now." }, { status: 503 });
        }
    }

    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = bookLeadSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
            { status: 400 }
        );
    }

    const result = await captureBookLead(parsed.data);
    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, downloadUrl: result.downloadUrl, emailSent: result.emailSent });
}
