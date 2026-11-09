import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";

type Admin = SupabaseClient<Database>;

const PAGE_SIZE = 1000;

/**
 * Every enabled, business-scoped schedule that is due now, paged with a stable order so the
 * PostgREST 1000-row cap (or a fixed limit) can never starve schedules behind older ones.
 */
export async function loadDueReportScheduleIds(db: Admin, now = new Date()): Promise<string[]> {
    const { data, error } = await fetchAllReviewRowsPaginated<{ id: string }>(PAGE_SIZE, (from, to) =>
        db.from("aeo_report_schedules" as never)
            .select("id" as never)
            .eq("enabled" as never, true as never)
            .not("business_id" as never, "is", null)
            .lte("next_send_at" as never, now.toISOString() as never)
            .order("next_send_at" as never, { ascending: true })
            .order("id" as never, { ascending: true })
            .range(from, to) as unknown as PromiseLike<{ data: { id: string }[] | null; error: { message: string } | null }>);
    if (error) throw new Error(`Unable to load due report schedules: ${error.message}`);
    return data.map((row) => row.id);
}
