import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { generateStoredAeoReport } from "@/services/aeo/reporting/generate-report";
import { nextReportSend, reportPeriod } from "@/services/aeo/reporting/report-schedule";
import { sendEmail } from "@/services/resend/send-email";

type Admin = SupabaseClient<Database>;

export type AeoReportSchedule = {
    id: string; organization_id: string; business_id: string | null; cadence: "weekly" | "monthly";
    recipients: string[]; enabled: boolean; next_send_at: string;
};

/** Small, JSON-safe step output: the PDF and HTML stay in storage/DB, never in Inngest state. */
export type AeoReportEnvelope = {
    reportId: string; path: string; alreadySent: boolean;
    subject: string; filename: string; from: string | null;
};

type ReportRow = { id: string; storage_path: string | null; delivery_status: string; sent_at: string | null };
type Branding = { businessName: string; brandName: string; senderDomain: string | null; senderDomainVerified: boolean };

/** Lower-cased, de-duplicated recipients so one address is never mailed twice per occurrence. */
export function uniqueRecipients(recipients: string[]): string[] {
    return [...new Set(recipients.map((r) => r.trim().toLowerCase()).filter(Boolean))];
}

function envelopeFrom(report: { reportId: string; path: string; alreadySent: boolean }, brand: Branding): AeoReportEnvelope {
    return {
        ...report,
        subject: `${brand.businessName} AI visibility report`,
        filename: `${brand.businessName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-aeo-report.pdf`,
        from: brand.senderDomainVerified && brand.senderDomain
            ? `${brand.brandName.replace(/["<>]/g, "")} <reports@${brand.senderDomain}>` : null,
    };
}

async function loadBranding(db: Admin, schedule: AeoReportSchedule): Promise<Branding> {
    const [business, org] = await Promise.all([
        db.from("businesses").select("name").eq("id", schedule.business_id as string).single(),
        db.from("organizations" as never)
            .select("name, aeo_sender_domain, aeo_sender_domain_status" as never)
            .eq("id" as never, schedule.organization_id as never).single() as unknown as Promise<{
                data: { name: string; aeo_sender_domain: string | null; aeo_sender_domain_status: string } | null;
                error: { message: string } | null;
            }>,
    ]);
    if (business.error || org.error || !org.data) throw new Error("Unable to load report branding");
    return {
        businessName: business.data?.name ?? "Business", brandName: org.data.name,
        senderDomain: org.data.aeo_sender_domain, senderDomainVerified: org.data.aeo_sender_domain_status === "verified",
    };
}

/**
 * One report per schedule occurrence. An occurrence starts at the schedule's current
 * `next_send_at`; a report already stored since then (a crashed or re-queued run) is
 * reused instead of generating another PDF row.
 */
export async function prepareOccurrenceReport(db: Admin, schedule: AeoReportSchedule): Promise<AeoReportEnvelope> {
    const existing = await db.from("aeo_reports" as never)
        .select("id, storage_path, delivery_status, sent_at" as never)
        .eq("schedule_id" as never, schedule.id as never)
        .gte("created_at" as never, schedule.next_send_at as never)
        .order("created_at" as never, { ascending: false })
        .limit(1) as unknown as { data: ReportRow[] | null; error: { message: string } | null };
    if (existing.error) throw new Error(`Unable to load existing report: ${existing.error.message}`);
    const prior = existing.data?.find((row) => row.storage_path);
    if (prior?.storage_path) {
        const brand = await loadBranding(db, schedule);
        // `sent_at` is stamped on the first accepted delivery, so a crashed run is never re-mailed.
        const alreadySent = prior.delivery_status !== "generated" || Boolean(prior.sent_at);
        return envelopeFrom({ reportId: prior.id, path: prior.storage_path, alreadySent }, brand);
    }
    const report = await generateStoredAeoReport(db, {
        organizationId: schedule.organization_id, businessId: schedule.business_id as string,
        scheduleId: schedule.id, range: reportPeriod(schedule.cadence), recipients: uniqueRecipients(schedule.recipients),
    });
    const { businessName, brandName, senderDomain, senderDomainVerified } = report.model;
    return envelopeFrom({ reportId: report.reportId, path: report.path, alreadySent: false }, {
        businessName, brandName, senderDomain: senderDomain ?? null, senderDomainVerified: Boolean(senderDomainVerified),
    });
}

/** Sends the stored report to one recipient; the idempotency key stops provider-side duplicates. */
export async function sendOccurrenceReport(db: Admin, envelope: AeoReportEnvelope, recipient: string): Promise<{ sent: true }> {
    const row = await db.from("aeo_reports" as never).select("html" as never)
        .eq("id" as never, envelope.reportId as never).single() as unknown as {
            data: { html: string | null } | null; error: { message: string } | null;
        };
    if (row.error || !row.data?.html) throw new Error("Stored report HTML unavailable");
    const stored = await db.storage.from("aeo-reports").download(envelope.path);
    if (stored.error) throw new Error(`Stored report unavailable: ${stored.error.message}`);
    const sent = await sendEmail({
        to: recipient,
        ...(envelope.from ? { from: envelope.from } : {}),
        subject: envelope.subject,
        html: row.data.html,
        attachments: [{ filename: envelope.filename, content: Buffer.from(await stored.data.arrayBuffer()).toString("base64") }],
        idempotencyKey: `aeo-report/${envelope.reportId}/${recipient}`,
    });
    if (!sent.sent) throw new Error(sent.error ?? "Report email was not accepted");
    // Mark delivery as started; best effort, the Inngest step memo already guards this run.
    await db.from("aeo_reports" as never).update({ sent_at: new Date().toISOString() } as never)
        .eq("id" as never, envelope.reportId as never).is("sent_at" as never, null);
    return { sent: true };
}

/** How long an occurrence nobody received is retried by the daily cron before it is given up. */
export const UNDELIVERED_RETRY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Closes the occurrence. When every recipient failed (a likely systemic failure such as a
 * provider outage, missing key or storage error) and the occurrence is still inside its retry
 * window, the schedule is left due so the next daily cron retries the same stored report;
 * nobody received it, so a retry cannot duplicate. Otherwise it records the outcome and advances.
 */
export async function completeOccurrence(db: Admin, input: {
    schedule: AeoReportSchedule; reportId: string | null; sentCount: number; failed: string[];
}): Promise<{ advanced: boolean }> {
    const now = new Date().toISOString();
    const errorMessage = input.failed.length ? `Delivery failed for: ${input.failed.join(", ")}`.slice(0, 1000) : null;
    const retry = Boolean(input.reportId) && input.sentCount === 0 && input.failed.length > 0
        && Date.now() - Date.parse(input.schedule.next_send_at) < UNDELIVERED_RETRY_WINDOW_MS;
    if (input.reportId) {
        const report = await db.from("aeo_reports" as never).update((retry
            // Stays "generated" with no sent_at, so the next run reuses this report and sends again.
            ? { error_message: errorMessage }
            : {
                delivery_status: input.sentCount > 0 ? "sent" : "failed",
                ...(input.sentCount > 0 ? { sent_at: now } : {}),
                error_message: errorMessage,
            }) as never).eq("id" as never, input.reportId as never) as unknown as { error: { message: string } | null };
        if (report.error) throw new Error(`Unable to record report delivery: ${report.error.message}`);
    }
    if (retry) return { advanced: false };
    const schedule = await db.from("aeo_report_schedules" as never).update({
        ...(input.sentCount > 0 ? { last_sent_at: now } : {}),
        next_send_at: nextReportSend(input.schedule.cadence), updated_at: now,
    } as never).eq("id" as never, input.schedule.id as never) as unknown as { error: { message: string } | null };
    if (schedule.error) throw new Error(`Unable to advance report schedule: ${schedule.error.message}`);
    return { advanced: true };
}
