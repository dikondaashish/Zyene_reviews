import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { findUncitedRelevantPages } from "@/services/aeo/analytics/uncited-page-gaps";
import type { Phase2OperationsData } from "./phase2-types";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

type Db = SupabaseClient<Database>;
type RowResult<T> = { data: T[] | null };

export async function loadPhase2Operations(db: Db, businessId: string, organizationId: string): Promise<Phase2OperationsData> {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const [pages, prompts, citations, diagnosticsRaw, logsRaw, reviewsRaw, recsRaw, reportsRaw, schedulesRaw, keysRaw, channelsRaw, logSourcesRaw] = await Promise.all([
        db.from("crawl_pages").select("url, title").eq("business_id", businessId).eq("http_status", 200).order("fetched_at", { ascending: false }).limit(500),
        db.from("aeo_prompts").select("id, prompt_text").eq("business_id", businessId).eq("is_active", true),
        db.from("aeo_citations").select("normalized_url").eq("business_id", businessId).eq("classification", "own"),
        db.from("aeo_page_diagnostics" as never).select("url, js_delta_ratio, lcp_ms, cls, inp_ms, index_status" as never).eq("business_id" as never, businessId as never).order("checked_at" as never, { ascending: false }).limit(50),
        db.from("aeo_crawler_access_logs" as never).select("crawler, occurred_at" as never).eq("business_id" as never, businessId as never).gte("occurred_at" as never, since as never),
        db.from("aeo_review_citation_matches" as never).select("answer_excerpt, review_excerpt, confidence, created_at" as never).eq("business_id" as never, businessId as never).order("created_at" as never, { ascending: false }).limit(30),
        db.from("aeo_recommendations" as never).select("id, recommendation_type, title, status, target_url, latest_impact" as never).eq("business_id" as never, businessId as never).order("created_at" as never, { ascending: false }).limit(50),
        db.from("aeo_reports" as never).select("id, period_start, period_end, delivery_status, created_at" as never).eq("organization_id" as never, organizationId as never).order("created_at" as never, { ascending: false }).limit(20),
        db.from("aeo_report_schedules" as never).select("id, cadence, recipients, next_send_at, enabled" as never).eq("organization_id" as never, organizationId as never).order("created_at" as never, { ascending: false }),
        db.from("aeo_public_api_keys" as never).select("id, name, key_prefix, scopes, last_used_at, revoked_at" as never).eq("organization_id" as never, organizationId as never).order("created_at" as never, { ascending: false }),
        db.from("aeo_alert_channels" as never).select("id, name, channel_type, enabled, last_delivery_status" as never).eq("organization_id" as never, organizationId as never).order("created_at" as never, { ascending: false }),
        db.from("aeo_crawler_log_sources" as never).select("id, name, source, key_prefix, last_received_at" as never).eq("organization_id" as never, organizationId as never).order("created_at" as never, { ascending: false }),
    ]);
    assertAeoQueriesSucceeded("Unable to load Phase 2 operations", pages, prompts, citations, diagnosticsRaw,
        logsRaw, reviewsRaw, recsRaw, reportsRaw, schedulesRaw, keysRaw, channelsRaw, logSourcesRaw);
    const diagnostics = (diagnosticsRaw as unknown as RowResult<{ url: string; js_delta_ratio: number | null; lcp_ms: number | null; cls: number | null; inp_ms: number | null; index_status: string | null }>).data ?? [];
    const logRows = (logsRaw as unknown as RowResult<{ crawler: string; occurred_at: string }>).data ?? [];
    const hitMap = new Map<string, { count: number; latest: string }>();
    for (const row of logRows) {
        const hit = hitMap.get(row.crawler) ?? { count: 0, latest: row.occurred_at };
        hit.count += 1; if (row.occurred_at > hit.latest) hit.latest = row.occurred_at; hitMap.set(row.crawler, hit);
    }
    const pageGaps = findUncitedRelevantPages({
        pages: (pages.data ?? []).map((row) => ({ url: row.url, text: `${row.title ?? ""} ${row.url}` })),
        prompts: (prompts.data ?? []).map((row) => ({ id: row.id, text: row.prompt_text })),
        citedUrls: new Set((citations.data ?? []).map((row) => row.normalized_url)),
    }).slice(0, 30);
    const businesses = await db.from("businesses").select("id, name").eq("organization_id", organizationId);
    assertAeoQueriesSucceeded("Unable to load Phase 2 organization rollup", businesses);
    const businessIds = (businesses.data ?? []).map((row) => row.id);
    const samples = businessIds.length ? await db.from("aeo_samples").select("id, business_id, status").in("business_id", businessIds).eq("is_estimated", false).gte("sampled_at", since) : { data: [], error: null };
    assertAeoQueriesSucceeded("Unable to load Phase 2 rollup samples", samples);
    const successfulIds = (samples.data ?? []).filter((row) => row.status === "ok").map((row) => row.id);
    const mentions = successfulIds.length ? await db.from("aeo_brand_mentions").select("sample_id").eq("brand_kind", "own").eq("cited_only", false).in("sample_id", successfulIds) : { data: [], error: null };
    assertAeoQueriesSucceeded("Unable to load Phase 2 rollup mentions", mentions);
    const named = new Set((mentions.data ?? []).map((row) => row.sample_id));
    const orgRollup = (businesses.data ?? []).map((business) => {
        const rows = (samples.data ?? []).filter((sample) => sample.business_id === business.id && sample.status === "ok");
        return { id: business.id, name: business.name ?? "Business", samples: rows.length, visibility: rows.length ? rows.filter((row) => named.has(row.id)).length / rows.length : null };
    });
    const reviewRows = (reviewsRaw as unknown as RowResult<{ answer_excerpt: string; review_excerpt: string; confidence: number; created_at: string }>).data ?? [];
    const recommendationRows = (recsRaw as unknown as RowResult<{ id: string; recommendation_type: string; title: string; status: string; target_url: string | null; latest_impact: unknown }>).data ?? [];
    const reportRows = (reportsRaw as unknown as RowResult<{ id: string; period_start: string; period_end: string; delivery_status: string; created_at: string }>).data ?? [];
    const scheduleRows = (schedulesRaw as unknown as RowResult<{ id: string; cadence: string; recipients: string[]; next_send_at: string; enabled: boolean }>).data ?? [];
    const keyRows = (keysRaw as unknown as RowResult<{ id: string; name: string; key_prefix: string; scopes: string[]; last_used_at: string | null; revoked_at: string | null }>).data ?? [];
    const channelRows = (channelsRaw as unknown as RowResult<{ id: string; name: string; channel_type: string; enabled: boolean; last_delivery_status: string | null }>).data ?? [];
    const logSourceRows = (logSourcesRaw as unknown as RowResult<{ id: string; name: string; source: string; key_prefix: string; last_received_at: string | null }>).data ?? [];
    return {
        pageGaps,
        diagnostics: diagnostics.map((row) => ({ url: row.url, jsDelta: row.js_delta_ratio, lcp: row.lcp_ms, cls: row.cls, inp: row.inp_ms, indexStatus: row.index_status })),
        crawlerHits: [...hitMap].map(([crawler, value]) => ({ crawler, ...value })).sort((a, b) => b.count - a.count),
        reviewMatches: reviewRows.map((row) => ({ answerExcerpt: row.answer_excerpt, reviewExcerpt: row.review_excerpt, confidence: row.confidence, at: row.created_at })),
        recommendations: recommendationRows.map((row) => ({ id: row.id, type: row.recommendation_type, title: row.title, status: row.status, targetUrl: row.target_url, impact: row.latest_impact })),
        reports: reportRows.map((row) => ({ id: row.id, period: `${row.period_start} to ${row.period_end}`, status: row.delivery_status, createdAt: row.created_at })),
        schedules: scheduleRows.map((row) => ({ id: row.id, cadence: row.cadence, recipients: row.recipients, nextSendAt: row.next_send_at, enabled: row.enabled })),
        apiKeys: keyRows.map((row) => ({ id: row.id, name: row.name, prefix: row.key_prefix, scopes: row.scopes, lastUsedAt: row.last_used_at, revokedAt: row.revoked_at })),
        channels: channelRows.map((row) => ({ id: row.id, name: row.name, type: row.channel_type, enabled: row.enabled, deliveryStatus: row.last_delivery_status })),
        logSources: logSourceRows.map((row) => ({ id: row.id, name: row.name, source: row.source, prefix: row.key_prefix, lastReceivedAt: row.last_received_at })),
        orgRollup,
    };
}
