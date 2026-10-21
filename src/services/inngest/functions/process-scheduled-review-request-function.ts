import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { acquireLock, releaseLock } from "@/lib/db/redis-lock";
import { processOneScheduled } from "@/lib/review-requests/process-scheduled-queue";
import type { DueRow } from "@/lib/review-requests/scheduled-queue-types";

export const processScheduledReviewRequest = inngest.createFunction(
    {
        id: "process-scheduled-review-request",
        name: "Process Scheduled Review Request",
        concurrency: {
            // Inngest free/hobby plans cap per-function concurrency at 5; higher values fail sync.
            limit: 5,
        },
    },
    { event: "review-request/scheduled.send" },
    async ({ event, step }) => {
        const admin = createAdminClient();
        const reviewRequestId = event.data.reviewRequestId;
        const sendAtIso = event.data.sendAt;

        const sendAt = new Date(sendAtIso);
        if (Number.isNaN(sendAt.getTime())) {
            throw new Error(`Invalid sendAt: ${sendAtIso}`);
        }

        // 1) Wait until scheduled time. Steps cannot be nested inside step.run, so this must be top-level;
        // a past sendAt resolves immediately.
        await step.sleepUntil("scheduled-wait", sendAt);

        // 2) Lock to prevent double-send (10 minutes)
        const lockKey = `lock:review-request:${reviewRequestId}`;
        const locked = await step.run("acquire-lock", async () => acquireLock(lockKey, 600));
        if (!locked) {
            return { status: "locked" };
        }

        try {
            // 3) Load row (must be queued) and process
            const row = await step.run("fetch-request", async () => {
                const { data } = await admin
                    .from("review_requests")
                    .select("id, business_id, customer_name, customer_phone, customer_email, channel, status")
                    .eq("id", reviewRequestId)
                    .maybeSingle();
                return data as (DueRow & { status: string }) | null;
            });

            if (!row) {
                return { status: "missing" };
            }
            if (row.status !== "queued") {
                return { status: "not_queued", current: row.status };
            }

            const result = await step.run("send-scheduled", async () => processOneScheduled(admin, row));
            return { status: result };
        } finally {
            await step.run("release-lock", async () => releaseLock(lockKey));
        }
    },
);
