import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import type { DueRow } from "./scheduled-queue-types";
import { processOneScheduled } from "./process-scheduled-one";

/**
 * Picks up manually scheduled review_requests (`queued` + `scheduled_for` in the past)
 * and sends them. Safe to run every few minutes (claims rows with queued→sending).
 */
export async function processDueScheduledReviewRequests(options: { limit?: number; admin?: SupabaseClient } = {}) {
    const admin = options.admin ?? createAdminClient();
    const limit = options.limit ?? 25;
    const nowIso = new Date().toISOString();

    const { data: due, error } = await admin
        .from("review_requests")
        .select("id, business_id, customer_name, customer_phone, customer_email, channel")
        .eq("status", "queued")
        .eq("trigger_source", "manual")
        .not("scheduled_for", "is", null)
        .lte("scheduled_for", nowIso)
        .order("scheduled_for", { ascending: true })
        .limit(limit);

    if (error) {
        logger.error({ err: error }, "[scheduled-queue] list due:");
        Sentry.captureException(error, { tags: { route: "scheduled-review-queue", step: "list" } });
        throw error;
    }

    const outcomes = await Promise.all(
        (due ?? []).map((row) => processOneScheduled(admin, row as DueRow))
    );

    const results = { attempted: outcomes.length, sent: 0, failed: 0, skipped: 0 };
    for (const outcome of outcomes) {
        if (outcome === "sent") results.sent++;
        else if (outcome === "failed") results.failed++;
        else results.skipped++;
    }

    return results;
}
