import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { detectCompetitorPageChanges } from "./page-change-detector";

type Admin = SupabaseClient<Database>;
type Stored = { competitor_id: string | null; normalized_url: string; content_hash: string; citation_count: number };

export async function refreshCompetitorPages(db: Admin, businessId: string) {
    const [citationResult, competitorResult, storedResult] = await Promise.all([
        db.from("aeo_citations").select("normalized_url, url, title").eq("business_id", businessId)
            .eq("classification", "competitor").order("created_at", { ascending: false }).limit(500),
        db.from("competitors").select("id, name").eq("business_id", businessId),
        db.from("aeo_competitor_page_snapshots" as never).select("competitor_id, normalized_url, content_hash, citation_count" as never)
            .eq("business_id" as never, businessId),
    ]);
    if (citationResult.error || competitorResult.error) throw new Error("Unable to load competitor page inputs");
    const counts = new Map<string, { url: string; title: string; count: number }>();
    for (const row of citationResult.data ?? []) {
        const prior = counts.get(row.normalized_url);
        counts.set(row.normalized_url, { url: row.url, title: row.title ?? "", count: (prior?.count ?? 0) + 1 });
    }
    const current: { url: string; contentHash: string; citations: number; title: string; competitorId: string | null }[] = [];
    for (const [normalized, citation] of [...counts].slice(0, 30)) {
        const safety = await checkOriginIsPublic(citation.url);
        if (!safety.safe) continue;
        try {
            const response = await fetch(citation.url, { redirect: "error", signal: AbortSignal.timeout(12_000),
                headers: { "User-Agent": "Zyene-AEO-Competitor-Monitor/1.0" } });
            if (!response.ok) continue;
            const html = (await response.text()).slice(0, 2_000_000);
            const normalizedText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/\s+/g, " ").trim();
            const competitor = (competitorResult.data ?? []).find((row) =>
                normalizedText.toLowerCase().includes(row.name.toLowerCase()) || citation.title.toLowerCase().includes(row.name.toLowerCase()));
            current.push({ url: normalized, contentHash: createHash("sha256").update(normalizedText).digest("hex"),
                citations: citation.count, title: citation.title, competitorId: competitor?.id ?? null });
        } catch { /* One inaccessible page must not suppress the other pages. */ }
    }
    const previous = ((storedResult.data ?? []) as unknown as Stored[]).map((row) => ({
        url: row.normalized_url, contentHash: row.content_hash, citations: row.citation_count,
    }));
    const changes = detectCompetitorPageChanges(previous, current);
    for (const change of changes) {
        const now = current.find((row) => row.url === change.url);
        const before = ((storedResult.data ?? []) as unknown as Stored[]).find((row) => row.normalized_url === change.url);
        if (!now) continue;
        for (const changeType of change.changeTypes) {
            const insert = await db.from("aeo_competitor_page_changes" as never).insert({
                business_id: businessId, competitor_id: now.competitorId, normalized_url: now.url,
                change_type: changeType, previous_hash: before?.content_hash ?? null, current_hash: now.contentHash,
                previous_citation_count: before?.citation_count ?? null, current_citation_count: now.citations,
            } as never);
            if (insert.error) throw new Error(`Competitor change insert failed: ${insert.error.message}`);
        }
    }
    for (const row of current) {
        const write = await db.from("aeo_competitor_page_snapshots" as never).upsert({
            business_id: businessId, competitor_id: row.competitorId, normalized_url: row.url, title: row.title,
            content_hash: row.contentHash, citation_count: row.citations, checked_at: new Date().toISOString(),
        } as never, { onConflict: "business_id,normalized_url" });
        if (write.error) throw new Error(`Competitor snapshot upsert failed: ${write.error.message}`);
    }
    return { checked: current.length, changes: changes.reduce((sum, row) => sum + row.changeTypes.length, 0) };
}
