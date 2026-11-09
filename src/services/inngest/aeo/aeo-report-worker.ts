import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import {
    completeOccurrence, prepareOccurrenceReport, sendOccurrenceReport, uniqueRecipients, type AeoReportSchedule,
} from "@/services/aeo/reporting/aeo-report-occurrence";

export const aeoReportWorker = inngest.createFunction(
    { id: "aeo-report-worker", concurrency: { key: "event.data.scheduleId", limit: 1 }, retries: 2 },
    { event: "aeo/report.requested" },
    async ({ event, step }) => {
        const admin = createAdminClient();
        const loaded = await step.run("load-schedule", async () => {
            const result = await admin.from("aeo_report_schedules" as never)
                .select("id, organization_id, business_id, cadence, recipients, enabled, next_send_at" as never)
                .eq("id" as never, event.data.scheduleId as never).maybeSingle() as unknown as {
                    data: AeoReportSchedule | null; error: { message: string } | null;
                };
            if (result.error) throw new Error(`Unable to load report schedule: ${result.error.message}`);
            const schedule = result.data;
            return { schedule, due: Boolean(schedule && Date.parse(schedule.next_send_at) <= Date.now()) };
        });
        const schedule = loaded.schedule;
        if (!schedule?.enabled) return { skipped: "inactive" as const };
        // A re-queued event for an occurrence that already finished must not send again.
        if (!loaded.due) return { skipped: "not_due" as const };
        if (!schedule.business_id) {
            // Org-wide schedules have no report generator; advance so they never pin the due queue.
            await step.run("advance-org-only-schedule", () =>
                completeOccurrence(admin, { schedule, reportId: null, sentCount: 0, failed: [] }));
            logger.warn({ scheduleId: schedule.id }, "[aeo-report] org-only schedule skipped and advanced");
            return { skipped: "org_only" as const };
        }
        const report = await step.run("generate-report", () => prepareOccurrenceReport(admin, schedule));
        const recipients = uniqueRecipients(schedule.recipients);
        let sentCount = 0;
        const failed: string[] = [];
        if (!report.alreadySent) {
            for (const [index, recipient] of recipients.entries()) {
                try {
                    await step.run(`send-report-${index}`, () => sendOccurrenceReport(admin, report, recipient));
                    sentCount += 1;
                } catch (error) {
                    // Retries are exhausted for this recipient; record it and keep the occurrence moving.
                    failed.push(recipient);
                    logger.error({ err: error, scheduleId: schedule.id, reportId: report.reportId }, "[aeo-report] recipient delivery failed");
                }
            }
        }
        const completed = await step.run("complete-schedule", () => completeOccurrence(admin, {
            schedule, reportId: report.alreadySent ? null : report.reportId,
            sentCount, failed,
        }));
        if (!completed.advanced) {
            logger.warn({ scheduleId: schedule.id, reportId: report.reportId }, "[aeo-report] no recipient reached; retrying next cron");
        }
        return {
            reportId: report.reportId, recipients: recipients.length, sent: sentCount, failed: failed.length,
            advanced: completed.advanced,
        };
    }
);
