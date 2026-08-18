import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { generateStoredAeoReport } from "@/services/aeo/reporting/generate-report";
import { nextReportSend, reportPeriod } from "@/services/aeo/reporting/report-schedule";
import { sendEmail } from "@/services/resend/send-email";

export const aeoReportWorker = inngest.createFunction(
    { id: "aeo-report-worker", concurrency: { key: "event.data.scheduleId", limit: 1 }, retries: 2 },
    { event: "aeo/report.requested" },
    async ({ event, step }) => {
        const admin = createAdminClient();
        const schedule = await step.run("load-schedule", async () => {
            const result = await admin.from("aeo_report_schedules" as never)
                .select("id, organization_id, business_id, cadence, recipients, enabled" as never)
                .eq("id" as never, event.data.scheduleId as never).maybeSingle() as unknown as {
                    data: { id: string; organization_id: string; business_id: string | null; cadence: "weekly" | "monthly"; recipients: string[]; enabled: boolean } | null;
                };
            return result.data;
        });
        if (!schedule?.enabled || !schedule.business_id) return { skipped: "inactive_or_org_only" as const };
        const range = reportPeriod(schedule.cadence);
        const report = await step.run("generate-report", () => generateStoredAeoReport(admin, {
            organizationId: schedule.organization_id, businessId: schedule.business_id as string,
            scheduleId: schedule.id, range, recipients: schedule.recipients,
        }));
        for (const [index, recipient] of schedule.recipients.entries()) {
            await step.run(`send-report-${index}`, async () => {
                const sent = await sendEmail({
                    to: recipient,
                    subject: `${report.model.businessName} AI visibility report`,
                    html: report.html,
                    attachments: [{ filename: `${report.model.businessName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-aeo-report.pdf`, content: Buffer.from(report.pdf).toString("base64") }],
                });
                if (!sent.sent) throw new Error(sent.error ?? "Report email was not accepted");
                return sent;
            });
        }
        await step.run("complete-schedule", async () => {
            const now = new Date().toISOString();
            await admin.from("aeo_reports" as never).update({ delivery_status: "sent", sent_at: now } as never).eq("id" as never, report.reportId as never);
            await admin.from("aeo_report_schedules" as never).update({ last_sent_at: now, next_send_at: nextReportSend(schedule.cadence), updated_at: now } as never).eq("id" as never, schedule.id as never);
        });
        return { reportId: report.reportId, recipients: schedule.recipients.length };
    }
);
