import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { inngest } from "@/services/inngest/client";

/**
 * Optional: Supabase DB webhook target for scheduled review requests.
 * If you configure Supabase to POST here on insert/update, we will forward the event to Inngest.
 *
 * Auth: set `SUPABASE_WEBHOOK_SECRET` and pass header:
 * `Authorization: Bearer <SUPABASE_WEBHOOK_SECRET>`
 */
export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.SUPABASE_WEBHOOK_SECRET?.trim();
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
        | { record?: { id?: string; scheduled_for?: string | null; status?: string | null } }
        | null;

    const id = body?.record?.id;
    const sendAt = body?.record?.scheduled_for;
    const status = body?.record?.status;

    if (!id || !sendAt || status !== "queued") {
        return NextResponse.json({ ok: true, skipped: true });
    }

    await inngest.send({
        name: "review-request/scheduled.send",
        data: { reviewRequestId: id, sendAt, trigger: "supabase-webhook" },
    });

    return NextResponse.json({ ok: true });
}

