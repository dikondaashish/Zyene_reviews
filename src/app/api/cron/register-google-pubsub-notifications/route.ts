import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { registerNotifications } from "@/services/google/notifications";
import { createLogger } from "@/lib/logger";
import { runCronJob } from "@/lib/cron/run-cron-job";

export const dynamic = "force-dynamic";

const log = createLogger("cron-register-google-pubsub-notifications");

export async function GET(request: Request) {
    return runCronJob(request, { name: "register-google-pubsub-notifications", cadence: "hourly" }, async () => {
        const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME?.trim();
        if (!topicName) {
            return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
        }

        const admin = createAdminClient();
        const { data: rows, error } = await admin.from("review_platforms").select("id, google_account_id").eq("platform", "google");

        if (error) {
            log.error({ err: error }, "Failed to list Google review_platforms rows");
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        const accountToPlatformId = new Map<string, string>();
        for (const row of rows ?? []) {
            const acc = typeof row.google_account_id === "string" ? row.google_account_id.trim() : "";
            if (!acc) continue;
            if (!accountToPlatformId.has(acc)) {
                accountToPlatformId.set(acc, row.id);
            }
        }

        const results = await Promise.all(
            [...accountToPlatformId.entries()].map(async ([googleAccountId, platformId]) => {
                try {
                    const { accessToken } = await getValidGoogleToken(platformId);
                    if (!accessToken) {
                        throw new Error("No access token (reconnect Google or check platform row)");
                    }
                    const accountName = `accounts/${googleAccountId}`;
                    await registerNotifications(accessToken, accountName, topicName);
                    log.info({ googleAccountId, platformId, topic: topicName }, "Registered GBP Pub/Sub notification settings for account");
                    return { googleAccountId, platformId, ok: true as const };
                } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : String(e);
                    log.warn({ googleAccountId, platformId, err: msg }, "Failed to register GBP Pub/Sub notification settings for account");
                    return { googleAccountId, platformId, ok: false as const };
                }
            }),
        );

        return NextResponse.json({
            success: true,
            registered: results.filter((result) => result.ok).length,
            failed: results.filter((result) => !result.ok).length,
        });
    });
}
