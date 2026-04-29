import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { registerNotifications } from "@/services/google/notifications";
import { createLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = createLogger("cron-register-google-pubsub-notifications");

/**
 * One-shot / occasional job: register account-level GBP Pub/Sub notification settings
 * (`registerNotifications`) for every distinct `google_account_id` on connected Google rows.
 *
 * Same auth pattern as other cron routes: `Authorization: Bearer <CRON_SECRET>`.
 * Does not change review sync or webhooks — only calls Google's Notifications API.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME?.trim();
    if (!topicName) {
        return NextResponse.json(
            { error: "GOOGLE_PUBSUB_TOPIC_NAME is not configured" },
            { status: 500 }
        );
    }

    const admin = createAdminClient();
    const { data: rows, error } = await admin
        .from("review_platforms")
        .select("id, google_account_id")
        .eq("platform", "google");

    if (error) {
        log.error({ err: error }, "Failed to list Google review_platforms rows");
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    /** One registration per Google Business account (covers all locations under that account). */
    const accountToPlatformId = new Map<string, string>();
    for (const row of rows ?? []) {
        const acc =
            typeof row.google_account_id === "string" ? row.google_account_id.trim() : "";
        if (!acc) continue;
        if (!accountToPlatformId.has(acc)) {
            accountToPlatformId.set(acc, row.id);
        }
    }

    const results: Array<{
        googleAccountId: string;
        platformId: string;
        ok: boolean;
        error?: string;
    }> = [];

    for (const [googleAccountId, platformId] of accountToPlatformId) {
        try {
            const { accessToken } = await getValidGoogleToken(platformId);
            if (!accessToken) {
                throw new Error("No access token (reconnect Google or check platform row)");
            }
            const accountName = `accounts/${googleAccountId}`;
            await registerNotifications(accessToken, accountName, topicName);
            results.push({ googleAccountId, platformId, ok: true });
            log.info(
                { googleAccountId, platformId, topic: topicName },
                "Registered GBP Pub/Sub notification settings for account"
            );
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ googleAccountId, platformId, ok: false, error: msg });
            log.warn(
                { googleAccountId, platformId, err: msg },
                "Failed to register GBP Pub/Sub notification settings for account"
            );
        }
    }

    return NextResponse.json({
        success: true,
        topic: topicName,
        distinctGoogleAccounts: results.length,
        results,
    });
}
