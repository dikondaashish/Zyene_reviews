import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/db/supabase/admin";

export async function GET(request: Request) {
    const id = new URL(request.url).searchParams.get("id");
    const target = new URL("/newsletter/unsubscribe", request.url);
    if (id) target.searchParams.set("id", id);
    else target.searchParams.set("error", "missing");
    return NextResponse.redirect(target, 303);
}

export async function POST(request: Request) {
    const formData = await request.formData();
    const parsed = z.object({ id: z.uuid() }).safeParse({ id: formData.get("id") });
    if (!parsed.success) {
        return NextResponse.redirect(new URL("/newsletter/unsubscribe?error=missing", request.url), 303);
    }

    const admin = createAdminClient();
    const { error } = await admin
        .from("marketing_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("id", parsed.data.id)
        .is("unsubscribed_at", null);

    if (error) {
        logger.error({ err: error }, "[newsletter/unsubscribe] failed:");
        return NextResponse.redirect(new URL("/newsletter/unsubscribe?error=server", request.url));
    }

    return NextResponse.redirect(new URL("/newsletter/unsubscribe?success=1", request.url), 303);
}
