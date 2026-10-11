import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/db/supabase/admin";

export async function GET(request: Request) {
    const id = z.uuid().safeParse(new URL(request.url).searchParams.get("id"));
    const target = new URL("/newsletter/unsubscribe", request.url);
    if (id.success) target.searchParams.set("id", id.data);
    else target.searchParams.set("error", "missing");
    return NextResponse.redirect(target, 303);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const oneClick = formData.get("List-Unsubscribe") === "One-Click";
        const id = oneClick ? new URL(request.url).searchParams.get("id") : formData.get("id");
        const parsed = z.object({ id: z.uuid() }).safeParse({ id });
        if (!parsed.success) {
            return oneClick ? NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 })
                : NextResponse.redirect(new URL("/newsletter/unsubscribe?error=missing", request.url), 303);
        }
        const { error } = await createAdminClient().from("marketing_subscribers")
            .update({ unsubscribed_at: new Date().toISOString() })
            .eq("id", parsed.data.id).is("unsubscribed_at", null);
        if (error) {
            logger.error({ err: error }, "[newsletter/unsubscribe] failed");
            return oneClick ? NextResponse.json({ error: "Unable to unsubscribe" }, { status: 500 })
                : NextResponse.redirect(new URL("/newsletter/unsubscribe?error=server", request.url), 303);
        }
        return oneClick ? NextResponse.json({ unsubscribed: true })
            : NextResponse.redirect(new URL("/newsletter/unsubscribe?success=1", request.url), 303);
    } catch (error: unknown) {
        logger.error({ err: error }, "[newsletter/unsubscribe] invalid request");
        return NextResponse.json({ error: "Unable to process unsubscribe request" }, { status: 400 });
    }
}
