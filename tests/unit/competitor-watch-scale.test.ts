import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    admin: vi.fn(),
    send: vi.fn(),
    heartbeat: vi.fn(),
    places: vi.fn(),
    enrichment: vi.fn(),
    scan: vi.fn(),
    alertEmail: vi.fn(),
    insights: vi.fn(),
    runRow: vi.fn(),
    runCronJob: vi.fn(),
    recordEvents: vi.fn(),
    recordSnapshots: vi.fn(),
}));

vi.mock("@/services/inngest/client", () => ({
    inngest: {
        send: mocks.send,
        createFunction: (config: unknown, _trigger: unknown, handler: unknown) => ({ config, handler }),
    },
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/monitoring/competitor-watch-heartbeat", () => ({ pingCompetitorWatchHeartbeat: mocks.heartbeat }));
vi.mock("@/lib/notifications/send-competitor-alert-email", () => ({ sendCompetitorAlertEmail: mocks.alertEmail }));
vi.mock("@/lib/cron/run-cron-job", () => ({ runCronJob: mocks.runCronJob }));
vi.mock("@/services/competitors/live-metrics-outcome", () => ({ fetchCompetitorMetricsOutcome: mocks.places }));
vi.mock("@/services/competitors/external-metrics", () => ({
    fetchCompetitorPlaceEnrichment: mocks.enrichment,
    competitorEnrichmentToSnapshotMetadata: () => ({}),
}));
vi.mock("@/domains/ai/services/generate-competitor-insight", () => ({ generateCompetitorInsight: vi.fn() }));

import { executeCompetitorWatchCron } from "@/services/cron/competitor-watch-run";
import { loadCompetitorSnapshotHistory } from "@/services/cron/competitor-watch-snapshots";
import {
    placesUnavailableCompetitorIds,
    syncCompetitorWatchRowMetrics,
} from "@/services/cron/competitor-watch-row-metrics";
import {
    competitorWatchRunStatus,
    recordCompetitorWatchEvents,
    recordCompetitorWatchSnapshots,
} from "@/services/cron/competitor-watch-finish";
import type { CompetitorWatchScanState } from "@/services/cron/competitor-watch-types";

type Row = Record<string, unknown>;

/** PostgREST-like table: honours eq/in, and caps every response at 1000 rows unless ranged. */
function pagedDb(tables: Record<string, Row[]>) {
    const inserts: Record<string, Row[]> = {};
    const from = (table: string) => {
        const filters: Array<(r: Row) => boolean> = [];
        let range: [number, number] | null = null;
        const q = {
            select: () => q,
            eq: (c: string, v: unknown) => { filters.push((r) => r[c] === v); return q; },
            in: (c: string, vs: unknown[]) => { filters.push((r) => vs.includes(r[c])); return q; },
            order: () => q,
            range: (a: number, b: number) => { range = [a, b]; return q; },
            maybeSingle: async () => ({ data: (tables[table] ?? []).filter((r) => filters.every((f) => f(r)))[0] ?? null, error: null }),
            insert: async (rows: Row[]) => { (inserts[table] ??= []).push(...rows); return { error: null }; },
            update: () => ({ eq: async () => ({ error: null }) }),
            then: (resolve: (v: { data: Row[]; error: null }) => unknown) => {
                const all = (tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
                const [a, b] = range ?? [0, 999];
                return Promise.resolve(resolve({ data: all.slice(a, Math.min(b, a + 999) + 1), error: null }));
            },
        };
        return q;
    };
    return { client: { from, rpc: vi.fn(async () => ({ data: true, error: null })) }, inserts };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("competitor watch fan-out", () => {
    it("dispatches one deterministic event per business, including businesses past the first 1000 competitors", async () => {
        const competitors: Row[] = [];
        for (let i = 0; i < 2100; i++) competitors.push({ id: `c${i}`, business_id: i < 2050 ? "biz-a" : "biz-late" });
        competitors.push({ id: "cx", business_id: "biz-b" });
        const db = pagedDb({ competitors });
        mocks.admin.mockReturnValue(db.client);

        const res = await executeCompetitorWatchCron("2026-11-09");
        expect(res.status).toBe(200);

        const events = mocks.send.mock.calls.flatMap((call) => call[0] as Array<{ id: string; name: string; data: Row }>);
        expect(events.map((e) => e.id).sort()).toEqual([
            "cron:competitor-watch:2026-11-09:biz-a",
            "cron:competitor-watch:2026-11-09:biz-b",
            "cron:competitor-watch:2026-11-09:biz-late",
        ]);
        expect(new Set(events.map((e) => e.name))).toEqual(new Set(["cron/competitor-watch.business"]));
        // The fan-out never scans Google itself and never takes the old global advisory lock.
        expect(mocks.places).not.toHaveBeenCalled();
        expect(db.client.rpc).not.toHaveBeenCalled();
        // Accepting events proves no scan ran; success is pinged by the worker after a real scan.
        expect(mocks.heartbeat).not.toHaveBeenCalledWith(true);
    });

    it("the route allows a stale rerun (dispatch is deduplicated) and declares a maxDuration", async () => {
        const route = await import("@/app/api/cron/competitor-watch/route");
        expect(route.maxDuration).toBeGreaterThan(0);
        mocks.runCronJob.mockResolvedValue(new Response("ok"));
        await route.GET(new Request("https://x/api/cron/competitor-watch"));
        expect(mocks.runCronJob.mock.calls[0][1]).toMatchObject({ name: "competitor-watch", retryOnInterruption: true });
    });
});

describe("competitor snapshot history", () => {
    it("pages past 1000 rows so later competitors still get a baseline", async () => {
        const snapshots: Row[] = [];
        for (let i = 0; i < 1500; i++) {
            snapshots.push({ id: `s${i}`, competitor_id: `busy${i % 100}`, captured_at: "2026-11-08", average_rating: 4, total_reviews: i, metadata: null });
        }
        snapshots.push({ id: "quiet", competitor_id: "quiet", captured_at: "2026-01-01", average_rating: 3.5, total_reviews: 12, metadata: { provider_place_id: "places/q" } });
        const ids = [...Array.from({ length: 100 }, (_, i) => `busy${i}`), "quiet"];
        const db = pagedDb({ competitor_snapshots: snapshots });

        const { latestByCompetitor } = await loadCompetitorSnapshotHistory(db.client as never, ids);
        expect(latestByCompetitor.get("quiet")).toMatchObject({ total_reviews: 12, provider_place_id: "places/q" });
        expect(latestByCompetitor.size).toBe(101);
    });
});

describe("Places unavailable is not a success", () => {
    const state = (): CompetitorWatchScanState => ({
        admin: pagedDb({}).client as never,
        now: new Date("2026-11-09T06:00:00Z"),
        settingsByBusiness: new Map(), orgByBusiness: new Map(),
        latestByCompetitor: new Map(), recentByCompetitor: new Map(),
        snapshotsToInsert: [], eventsToInsert: [], appEventsToInsert: [], alertEmailQueue: [],
        insightInputByCompetitor: new Map(), businessExternalUpdates: new Map(), externalUpdates: 0,
    });
    const row = { id: "c1", business_id: "biz", name: "Taj", average_rating: 4.1, total_reviews: 50, google_url: null };

    it.each(["request_failed", "no_api_key"])("marks a competitor unavailable when the Google read is %s", async (reason) => {
        mocks.places.mockResolvedValue({ kind: "unavailable", reason });
        const s = state();
        await syncCompetitorWatchRowMetrics(s, row);
        expect(placesUnavailableCompetitorIds(s)).toEqual(["c1"]);
        expect(s.snapshotsToInsert[0]?.metadata).toMatchObject({ provider: "db_fallback" });
    });

    it("does not count a healthy 'no match on Google' as unavailable", async () => {
        mocks.places.mockResolvedValue({ kind: "not_found" });
        const s = state();
        await syncCompetitorWatchRowMetrics(s, row);
        expect(placesUnavailableCompetitorIds(s)).toEqual([]);
    });

    it("does not mark a live read unavailable", async () => {
        mocks.places.mockResolvedValue({ kind: "ok", metrics: { averageRating: 4.2, totalReviews: 51, provider: "google_places", placeId: null } });
        const s = state();
        await syncCompetitorWatchRowMetrics(s, row);
        expect(placesUnavailableCompetitorIds(s)).toEqual([]);
    });

    it("maps unavailability to failed / partial / success", () => {
        expect(competitorWatchRunStatus(3, 3)).toBe("failed");
        expect(competitorWatchRunStatus(3, 1)).toBe("partial");
        expect(competitorWatchRunStatus(3, 0)).toBe("success");
    });
});

describe("competitor watch writes", () => {
    it("events and snapshots are separate writes, and a failed events insert throws before any snapshot", async () => {
        const failing = { from: vi.fn(() => ({ insert: async () => ({ error: { message: "transient" } }) })) };
        await expect(recordCompetitorWatchEvents(failing as never, [{ id: "e" }], [])).rejects.toThrow(/events insert failed/);
        expect(failing.from).toHaveBeenCalledTimes(1);
        expect(failing.from).toHaveBeenCalledWith("competitor_events");

        const db = pagedDb({});
        expect(await recordCompetitorWatchSnapshots(db.client as never, [{ competitor_id: "c1" }])).toBe(1);
        expect(db.inserts.competitor_snapshots).toHaveLength(1);
        expect(db.inserts.competitor_events).toBeUndefined();
    });
});

describe("competitor watch business worker", () => {
    beforeEach(() => {
        vi.doMock("@/services/cron/competitor-watch-business", () => ({
            COMPETITOR_WATCH_BUSINESS_EVENT: "cron/competitor-watch.business",
            scanCompetitorWatchBusiness: mocks.scan,
        }));
        vi.doMock("@/services/cron/competitor-watch-finish", () => ({
            competitorWatchRunStatus,
            recordCompetitorWatchEvents: mocks.recordEvents,
            recordCompetitorWatchSnapshots: mocks.recordSnapshots,
            insertCompetitorWatchRunRow: mocks.runRow,
            storeCompetitorInsights: mocks.insights,
        }));
        vi.resetModules();
    });

    type Ctx = { event: { data: unknown }; step: { run: (id: string, fn: () => unknown) => Promise<unknown> } };
    async function loadWorker() {
        const mod = await import("@/services/inngest/competitor-watch-worker");
        return mod.competitorWatchBusinessWorker as unknown as {
            handler: (ctx: Ctx) => Promise<unknown>;
            config: { onFailure: (ctx: { event: { data: { event: { data: unknown } } }; error: Error }) => Promise<void> };
        };
    }

    it("logs a failed run when Google was unavailable, and sends each alert email in its own step", async () => {
        mocks.scan.mockResolvedValue({
            scanned: 2, externalUpdates: 0, snapshots: [{ competitor_id: "a" }, { competitor_id: "b" }], events: [], appEvents: [],
            placesUnavailable: 2,
            alertEmails: [
                { businessId: "biz", title: "a", summary: "a", eventType: "x" },
                { businessId: "biz", title: "b", summary: "b", eventType: "x" },
            ],
            insightInputs: [],
        });
        mocks.alertEmail.mockRejectedValueOnce(new Error("resend down")).mockResolvedValueOnce(undefined);
        mocks.insights.mockResolvedValue(0);
        mocks.recordEvents.mockResolvedValue(0);
        mocks.recordSnapshots.mockResolvedValue(2);
        const stepIds: string[] = [];
        const step = { run: async (id: string, fn: () => unknown) => { stepIds.push(id); return fn(); } };

        const worker = await loadWorker();
        await worker.handler({ event: { data: { businessId: "biz", occurrenceKey: "2026-11-09" } }, step });

        expect(stepIds).toEqual([
            "start", "scan", "record-events", "record-snapshots", "alert-email-0", "alert-email-1", "insights", "record-run",
        ]);
        expect(mocks.alertEmail).toHaveBeenCalledTimes(2);
        expect(mocks.runRow.mock.calls[0][1]).toMatchObject({ business_id: "biz", status: "failed", scanned: 2 });
        expect(mocks.runRow.mock.calls[0][1]).toMatchObject({ snapshots_created: 2, events_created: 0 });
        expect(mocks.runRow.mock.calls[0][1].error_message).toMatch(/unavailable/);
        expect(mocks.heartbeat).toHaveBeenCalledWith(false);
    });

    it("a retried snapshot write does not re-scan, so the day's events and alerts survive", async () => {
        mocks.scan.mockResolvedValue({
            scanned: 1, externalUpdates: 1, snapshots: [{ competitor_id: "a" }], events: [{ id: "drop" }], appEvents: [],
            placesUnavailable: 0, alertEmails: [{ businessId: "biz", title: "Rating drop", summary: "s", eventType: "rating_drop" }],
            insightInputs: [],
        });
        mocks.recordEvents.mockResolvedValue(1);
        mocks.recordSnapshots.mockRejectedValueOnce(new Error("transient")).mockResolvedValueOnce(1);
        mocks.insights.mockResolvedValue(0);
        // Minimal Inngest memoisation: a finished step returns its stored result on the retry.
        const memo = new Map<string, unknown>();
        const step = {
            run: async (id: string, fn: () => unknown) => {
                if (memo.has(id)) return memo.get(id);
                const out = await fn();
                memo.set(id, out);
                return out;
            },
        };
        const worker = await loadWorker();
        const ctx = { event: { data: { businessId: "biz" } }, step };
        await expect(worker.handler(ctx)).rejects.toThrow("transient");
        await worker.handler(ctx);

        expect(mocks.scan).toHaveBeenCalledTimes(1);
        expect(mocks.recordEvents).toHaveBeenCalledTimes(1);
        expect(mocks.alertEmail).toHaveBeenCalledTimes(1);
        expect(mocks.runRow.mock.calls[0][1]).toMatchObject({ status: "success", events_created: 1, snapshots_created: 1 });
        expect(mocks.heartbeat).toHaveBeenCalledWith(true);
    });

    it("records a failed run for the business when the worker exhausts its retries", async () => {
        const worker = await loadWorker();
        await worker.config.onFailure({ event: { data: { event: { data: { businessId: "biz" } } } }, error: new Error("boom") });
        expect(mocks.runRow.mock.calls[0][1]).toMatchObject({ business_id: "biz", status: "failed", error_message: "boom" });
        expect(mocks.heartbeat).toHaveBeenCalledWith(false);
    });
});
