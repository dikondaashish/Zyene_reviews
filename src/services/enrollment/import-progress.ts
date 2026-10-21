import type { SupabaseClient } from "@supabase/supabase-js";
import { startOfLocalDay } from "@/lib/review-requests/quiet-hours";

export type ImportIssue = { rowNumber: number; contact: string; problem: string };
export type ImportProgress = {
    id: string; source: string; fileName: string | null; status: string; dailyLimit: number;
    totalRows: number; validRows: number; invalidRows: number; duplicateRows: number;
    enrolledRows: number; enrolledToday: number; pendingRows: number; createdAt: string; issues: ImportIssue[];
};


/**
 * Progress for a campaign's imports, including row-level problems: rows we could not use
 * (invalid / duplicate) and enrolled rows the campaign then skipped or failed (with reason).
 */
export async function loadImportProgress(admin: SupabaseClient, businessId: string, campaignId: string): Promise<ImportProgress[]> {
    const { data: imports } = await admin.from("enrollment_imports")
        .select("id, source, file_name, status, daily_limit, total_rows, valid_rows, invalid_rows, duplicate_rows, enrolled_rows, created_at")
        .eq("business_id", businessId).eq("campaign_id", campaignId).order("created_at", { ascending: false }).limit(20);
    const { data: business } = await admin.from("businesses").select("timezone").eq("id", businessId).maybeSingle();
    const dayStart = startOfLocalDay(new Date(), business?.timezone as string | null).toISOString();
    const result: ImportProgress[] = [];
    for (const imp of imports ?? []) {
        const [{ count: pending }, { count: today }, { data: problems }, { data: outcomes }] = await Promise.all([
            admin.from("enrollment_import_rows").select("id", { count: "exact", head: true }).eq("import_id", imp.id).eq("status", "pending"),
            admin.from("enrollment_import_rows").select("id", { count: "exact", head: true }).eq("import_id", imp.id)
                .eq("status", "enrolled").gte("processed_at", dayStart),
            admin.from("enrollment_import_rows").select("row_number, customer_name, phone, email, reason")
                .eq("import_id", imp.id).in("status", ["invalid", "duplicate"]).order("row_number").limit(25),
            admin.from("enrollment_import_rows").select("row_number, customer_name, phone, email, review_requests(status, error_message)")
                .eq("import_id", imp.id).eq("status", "enrolled").not("review_request_id", "is", null).order("row_number").limit(500),
        ]);
        const contact = (r: { customer_name?: string | null; email?: string | null; phone?: string | null }) =>
            r.customer_name || r.email || r.phone || "Unknown";
        const issues: ImportIssue[] = (problems ?? []).map((r) => ({ rowNumber: r.row_number as number, contact: contact(r), problem: (r.reason as string) || "Not usable" }));
        for (const r of outcomes ?? []) {
            const req = (Array.isArray(r.review_requests) ? r.review_requests[0] : r.review_requests) as { status?: string; error_message?: string | null } | null;
            if (req && ["skipped", "failed"].includes(req.status ?? "") && issues.length < 50) {
                issues.push({ rowNumber: r.row_number as number, contact: contact(r), problem: req.error_message || `Not sent (${req.status})` });
            }
        }
        result.push({
            id: imp.id as string, source: imp.source as string, fileName: imp.file_name as string | null, status: imp.status as string,
            dailyLimit: imp.daily_limit as number, totalRows: imp.total_rows as number, validRows: imp.valid_rows as number,
            invalidRows: imp.invalid_rows as number, duplicateRows: imp.duplicate_rows as number, enrolledRows: imp.enrolled_rows as number,
            enrolledToday: today ?? 0, pendingRows: pending ?? 0, createdAt: imp.created_at as string,
            issues: issues.sort((a, b) => a.rowNumber - b.rowNumber),
        });
    }
    return result;
}
