import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeCrawlerLog, type IncomingCrawlerLog } from "./normalize-log";

export function hashIngestionKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
}

export async function ingestCrawlerLogs(db: SupabaseClient, key: string, logs: readonly IncomingCrawlerLog[]) {
    const source = await db.from("aeo_crawler_log_sources")
        .select("id, business_id, source")
        .eq("key_hash", hashIngestionKey(key)).eq("enabled", true).maybeSingle();
    if (source.error || !source.data) return { ok: false as const, reason: "unauthorized" as const };
    const sourceRow = source.data;
    const rows = logs.flatMap((log) => {
        const normalized = normalizeCrawlerLog(log);
        return normalized ? [{
            business_id: sourceRow.business_id,
            occurred_at: normalized.timestamp,
            crawler: normalized.crawler,
            method: normalized.method,
            path: normalized.path,
            status_code: normalized.status,
            user_agent: normalized.userAgent,
            request_id: normalized.requestId ?? null,
            source: sourceRow.source,
        }] : [];
    });
    if (rows.length > 0) {
        const inserted = await db.from("aeo_crawler_access_logs").upsert(rows, { onConflict: "business_id,source,request_id", ignoreDuplicates: true });
        if (inserted.error) throw new Error(`ingest crawler logs: ${inserted.error.message}`);
    }
    await db.from("aeo_crawler_log_sources").update({ last_received_at: new Date().toISOString() }).eq("id", sourceRow.id);
    return { ok: true as const, accepted: rows.length, ignored: logs.length - rows.length };
}
