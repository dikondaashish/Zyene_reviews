import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { inngest } from "@/services/inngest/client";
import { startOfLocalDay } from "@/lib/review-requests/quiet-hours";

type ActiveImport = {
    id: string; business_id: string; campaign_id: string; daily_limit: number; created_by: string | null;
    campaigns: { status: string } | { status: string }[] | null;
    businesses: { timezone: string | null } | { timezone: string | null }[] | null;
};

const MAX_PER_RUN = 100;
const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

/**
 * Enrolls the next pending rows of every active import, up to its daily limit for the
 * business's local day. Each row is claimed (pending -> enrolled) before its campaign job is
 * queued with a stable event id, so overlapping runs or retries cannot enroll a row twice.
 * Paused/archived campaigns are skipped without consuming the limit.
 */
export async function runEnrollmentImports(admin: SupabaseClient, now = new Date()) {
    const { data: imports, error } = await admin.from("enrollment_imports")
        .select("id, business_id, campaign_id, daily_limit, created_by, campaigns(status), businesses(timezone)")
        .eq("status", "active").order("last_run_at", { ascending: true, nullsFirst: true }).limit(50);
    if (error) throw error;
    const summary = { imports: 0, enrolled: 0, completed: 0, waiting: 0 };

    for (const imp of (imports ?? []) as ActiveImport[]) {
        summary.imports++;
        await admin.from("enrollment_imports").update({ last_run_at: now.toISOString() }).eq("id", imp.id);
        if (one(imp.campaigns)?.status !== "active" || !imp.created_by) {
            summary.waiting++;
            continue;
        }
        const dayStart = startOfLocalDay(now, one(imp.businesses)?.timezone).toISOString();
        const { count: today } = await admin.from("enrollment_import_rows").select("id", { count: "exact", head: true })
            .eq("import_id", imp.id).eq("status", "enrolled").gte("processed_at", dayStart);
        const room = Math.min(imp.daily_limit - (today ?? 0), MAX_PER_RUN);

        if (room > 0) {
            const { data: rows } = await admin.from("enrollment_import_rows").select("id, customer_name, phone, email")
                .eq("import_id", imp.id).eq("status", "pending").order("row_number").limit(room);
            const events = [];
            for (const row of rows ?? []) {
                const { data: claimed } = await admin.from("enrollment_import_rows")
                    .update({ status: "enrolled", processed_at: now.toISOString() })
                    .eq("id", row.id).eq("status", "pending").select("id").maybeSingle();
                if (!claimed) continue;
                events.push({
                    id: `import:${imp.id}:row:${row.id}`,
                    name: "campaign/send.contact" as const,
                    data: {
                        campaignId: imp.campaign_id, businessId: imp.business_id, userId: imp.created_by, importRowId: row.id,
                        contact: { name: row.customer_name ?? undefined, phone: row.phone ?? undefined, email: row.email ?? undefined },
                    },
                });
            }
            if (events.length) {
                await inngest.send(events);
                summary.enrolled += events.length;
            }
        }

        const [{ count: pending }, { count: enrolled }] = await Promise.all([
            admin.from("enrollment_import_rows").select("id", { count: "exact", head: true }).eq("import_id", imp.id).eq("status", "pending"),
            admin.from("enrollment_import_rows").select("id", { count: "exact", head: true }).eq("import_id", imp.id).eq("status", "enrolled"),
        ]);
        const patch: Record<string, unknown> = { enrolled_rows: enrolled ?? 0, updated_at: now.toISOString() };
        // Inbound-email streams stay open for new invoices; CSV imports finish when empty.
        const { data: meta } = await admin.from("enrollment_imports").select("source").eq("id", imp.id).maybeSingle();
        if (!pending && meta?.source === "csv") {
            patch.status = "completed";
            summary.completed++;
        }
        await admin.from("enrollment_imports").update(patch).eq("id", imp.id).eq("status", "active");
    }
    logger.info(summary, "[enrollment-imports] run complete");
    return summary;
}
