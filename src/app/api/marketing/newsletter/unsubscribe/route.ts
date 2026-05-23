import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";

export async function GET(request: Request) {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
        return NextResponse.redirect(new URL("/newsletter/unsubscribe?error=missing", request.url));
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("marketing_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("id", id)
        .is("unsubscribed_at", null)
        .select("email")
        .maybeSingle();

    if (error) {
        logger.error({ err: error }, "[newsletter/unsubscribe] failed:");
        return NextResponse.redirect(new URL("/newsletter/unsubscribe?error=server", request.url));
    }

    const emailParam = data?.email ? `&email=${encodeURIComponent(data.email)}` : "";
    return NextResponse.redirect(
        new URL(`/newsletter/unsubscribe?success=1${emailParam}`, request.url)
    );
}
