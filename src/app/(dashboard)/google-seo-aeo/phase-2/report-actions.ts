"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePhase2Context } from "./action-context";
import { generateStoredAeoReport } from "@/services/aeo/reporting/generate-report";
import { nextReportSend } from "@/services/aeo/reporting/report-schedule";

const scheduleSchema = z.object({
    cadence: z.enum(["weekly", "monthly"]),
    recipients: z.string().transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean))
        .pipe(z.array(z.string().email()).min(1).max(20)),
});

export async function createReportSchedule(formData: FormData) {
    const parsed = scheduleSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid report schedule");
    const { admin, businessId, organizationId } = await requirePhase2Context();
    const now = new Date();
    const result = await admin.from("aeo_report_schedules" as never).insert({
        organization_id: organizationId, business_id: businessId, cadence: parsed.data.cadence,
        recipients: parsed.data.recipients, next_send_at: nextReportSend(parsed.data.cadence, now),
    } as never);
    if (result.error) throw new Error("Unable to create report schedule");
    revalidatePath("/google-seo-aeo/phase-2");
}

export async function generateReportNow() {
    const { admin, businessId, organizationId } = await requirePhase2Context();
    const end = new Date(); const start = new Date(end); start.setUTCDate(start.getUTCDate() - 29);
    await generateStoredAeoReport(admin, {
        organizationId, businessId,
        range: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) },
    });
    revalidatePath("/google-seo-aeo/phase-2");
}
