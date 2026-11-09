import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    admin: vi.fn(),
    dispatchUnit: vi.fn(),
    affordable: vi.fn(),
    runnable: vi.fn(),
    deliver: vi.fn(),
    liveSampling: vi.fn(),
}));

vi.mock("@/services/inngest/client", () => ({
    inngest: { createFunction: (config: unknown, _t: unknown, handler: unknown) => ({ config, handler }) },
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/aeo/orchestration/dispatch-unit", () => ({ dispatchUnit: mocks.dispatchUnit }));
vi.mock("@/services/aeo/billing/aeo-balance", () => ({ loadAffordableTests: mocks.affordable }));
vi.mock("@/services/aeo/engines/engine-registry", () => ({ engineRegistry: { resolveRunnable: mocks.runnable } }));
vi.mock("@/services/aeo/engines/register-adapters", () => ({ registerAeoAdapters: () => undefined }));
vi.mock("@/services/aeo/orchestration/store-factory", () => ({ getAeoStores: () => ({}) }));
vi.mock("@/services/aeo/integrations/deliver-outbound-event", () => ({ deliverOutboundEvent: mocks.deliver }));
vi.mock("@/services/aeo/extraction/extract-sample", () => ({ extractSample: () => ({ mentions: [] }) }));
vi.mock("@/services/aeo/extraction/supabase-extraction-store", () => ({
    SupabaseExtractionStore: class { async loadBrandContext() { return {}; } async persist() { return 0; } },
}));
vi.mock("@/lib/features/aeo-surfaces", () => ({ isLiveSamplingEnabled: mocks.liveSampling }));

import { aeoDispatchWorker } from "@/services/inngest/aeo/aeo-dispatch-worker";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

type Ctx = { event: { data: unknown }; step: unknown };
const worker = aeoDispatchWorker as unknown as {
    handler: (ctx: Ctx) => Promise<unknown>;
    config: { onFailure: (ctx: Ctx) => Promise<unknown> };
};

const RUN = "10000000-0000-4000-8000-000000000001";
const unit = (promptId: string) => ({
    runId: RUN, businessId: "biz", organizationId: "org", promptId, promptText: "best plumber",
    engineId: "gemini", attempt: 1, locale: { country: "US", language: "en" }, usageDate: "2026-11-08",
    overageAuthorised: false, requestedUnits: 1,
});

let db: FakeDb;
let sent: { id: string; name: string }[];
let skipped: Set<string>;

/**
 * Mirrors the run counters from 20261108130000: samples + skipped units close
 * the run. Only the wiring is under test here; the SQL is asserted below.
 */
function run() { return db.tables.aeo_runs[0] as Record<string, unknown> & { expected_samples: number;
    completed_samples: number; skipped_samples: number; status: string }; }
function finalize() {
    const r = run();
    if (r.status !== "running" || r.completed_samples + r.skipped_samples < r.expected_samples) return false;
    r.status = r.completed_samples === 0 ? "deferred" : r.skipped_samples > 0 ? "partial" : "success";
    r.completed_at = "2026-11-08T00:00:00Z";
    return true;
}
const rpc = vi.fn(async (_name: string, args: { p_prompt_id: string; p_engine_id: string; p_attempt: number }) => {
    const key = `${args.p_prompt_id}:${args.p_engine_id}:${args.p_attempt}`;
    if (skipped.has(key)) return { data: [{ released: false, finalized: false }], error: null };
    skipped.add(key);
    run().skipped_samples += 1;
    return { data: [{ released: true, finalized: finalize() }], error: null };
});

const step = () => ({
    run: async (_id: string, fn: () => Promise<unknown>) => fn(),
    sendEvent: async (id: string, event: { name: string }) => { sent.push({ id, name: event.name }); },
});
const handle = (data: unknown) => worker.handler({ event: { data }, step: step() });

beforeEach(() => {
    vi.clearAllMocks();
    sent = [];
    skipped = new Set();
    db = createFakeDb({ aeo_runs: [{ id: RUN, status: "running", expected_samples: 2, completed_samples: 0,
        skipped_samples: 0, completed_at: null }] });
    mocks.admin.mockReturnValue({ ...db.client, from: db.client.from, rpc });
    mocks.liveSampling.mockReturnValue(true);
    mocks.runnable.mockReturnValue({ runnable: [{ id: "gemini" }] });
    mocks.affordable.mockResolvedValue(5);
    mocks.deliver.mockResolvedValue({ delivered: 1, failed: 0 });
    mocks.dispatchUnit.mockImplementation(async () => {
        run().completed_samples += 1; // the finalize trigger, on sample insert
        finalize();
        return { kind: "sampled", sampleId: "s1", duplicateRisk: false, overrunUnits: 0,
            result: { status: "failed" } };
    });
});

describe("AEO runs reach a terminal state when a unit stores no sample", () => {
    it("closes a run that a racing run drained of balance and announces completion", async () => {
        await handle(unit("p1"));
        expect(run().status).toBe("running");

        mocks.affordable.mockResolvedValue(0);
        await handle(unit("p2"));

        expect(rpc).toHaveBeenCalledWith("aeo_release_run_unit", expect.objectContaining({
            p_run_id: RUN, p_prompt_id: "p2", p_engine_id: "gemini", p_attempt: 1, p_reason: "insufficient_balance",
        }));
        expect(run().status).toBe("partial");
        expect(mocks.deliver).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            event: "aeo.run.completed", sourceId: RUN }));
        expect(sent).toEqual([{ id: "queue-phase3-refresh", name: "aeo/phase3.refresh.requested" }]);
    });

    it.each([
        ["engine_not_runnable", () => mocks.runnable.mockReturnValue({ runnable: [] })],
        ["deferred", () => mocks.dispatchUnit.mockResolvedValue({ kind: "deferred", deferredUnits: 1 })],
        ["live_sampling_disabled", () => mocks.liveSampling.mockReturnValue(false)],
    ])("releases the unit on %s", async (reason, arrange) => {
        arrange();
        await handle(unit("p1"));
        await handle(unit("p2"));
        expect(rpc).toHaveBeenCalledTimes(2);
        expect(rpc.mock.calls.every(([, args]) => (args as unknown as { p_reason: string }).p_reason === reason)).toBe(true);
        expect(run().status).toBe("deferred");
        expect(run().completed_at).not.toBeNull();
    });

    it("releases a unit whose retries are exhausted", async () => {
        await handle(unit("p1"));
        await worker.config.onFailure({ event: { data: { event: { data: unit("p2") } } }, step: step() });
        expect(rpc).toHaveBeenCalledWith("aeo_release_run_unit", expect.objectContaining({ p_reason: "dispatch_failed" }));
        expect(run().status).toBe("partial");
    });

    it("does not release a unit that stored a sample", async () => {
        await handle(unit("p1"));
        await handle(unit("p2"));
        expect(rpc).not.toHaveBeenCalled();
        expect(run().status).toBe("success");
    });
});

/** Inngest-style memoization: a completed step returns its stored result on replay. */
function memoStep() {
    const memo = new Map<string, unknown>();
    return {
        run: async (id: string, fn: () => Promise<unknown>) => {
            if (!memo.has(id)) memo.set(id, await fn());
            return memo.get(id);
        },
        sendEvent: async (id: string, event: { name: string }) => { sent.push({ id, name: event.name }); },
    };
}

describe("dispatch gate is memoized across Inngest replays", () => {
    it("a unit released as not runnable never samples on a replay where the engine is back", async () => {
        const s = memoStep();
        mocks.runnable.mockReturnValue({ runnable: [] });
        await worker.handler({ event: { data: unit("p1") }, step: s });
        expect(run().skipped_samples).toBe(1);

        mocks.runnable.mockReturnValue({ runnable: [{ id: "gemini" }] });
        const replay = await worker.handler({ event: { data: unit("p1") }, step: s });
        expect(replay).toEqual({ skipped: "engine_not_runnable", engineId: "gemini" });
        expect(mocks.dispatchUnit).not.toHaveBeenCalled();
        expect(run().completed_samples).toBe(0);
    });

    it("a unit released with live sampling off never samples once it is switched back on", async () => {
        const s = memoStep();
        mocks.liveSampling.mockReturnValue(false);
        await worker.handler({ event: { data: unit("p1") }, step: s });
        mocks.liveSampling.mockReturnValue(true);
        await worker.handler({ event: { data: unit("p1") }, step: s });
        expect(mocks.dispatchUnit).not.toHaveBeenCalled();
        expect(rpc).toHaveBeenCalledTimes(1);
    });

    it("retries instead of releasing when the engine disappears after a runnable gate", async () => {
        const s = memoStep();
        await s.run("check-dispatch-gate", async () => null);
        mocks.runnable.mockReturnValue({ runnable: [] });
        await expect(worker.handler({ event: { data: unit("p1") }, step: s })).rejects.toThrow(/unrunnable/);
        expect(rpc).not.toHaveBeenCalled();
        expect(run().skipped_samples).toBe(0);
    });
});

describe("20261108130000 migration", () => {
    const sql = readFileSync(path.join(process.cwd(),
        "supabase/migrations/20261108130000_aeo_run_skipped_units.sql"), "utf8");

    it("counts skipped units toward completion in the sample trigger's finalize path", () => {
        expect(sql).toMatch(/v_completed \+ v_skipped < v_expected/);
        expect(sql).toMatch(/PERFORM public\.aeo_finalize_run_if_complete\(NEW\.run_id\)/);
    });

    it("lets a late sample reclaim its unit's skip so the unit is never counted twice", () => {
        const trigger = sql.slice(sql.indexOf("FUNCTION public.finalize_aeo_run_sample()"));
        expect(trigger).toMatch(/DELETE FROM public\.aeo_run_skipped_units[\s\S]*NEW\.prompt_id::text \|\| ':' \|\| NEW\.engine_id \|\| ':' \|\| NEW\.attempt::text/);
        expect(trigger).toMatch(/skipped_samples = GREATEST\(0, skipped_samples - v_reclaimed\)/);
        expect(trigger.indexOf("DELETE FROM")).toBeLessThan(trigger.indexOf("PERFORM public.aeo_finalize_run_if_complete"));
    });

    it("keeps the release RPC idempotent and service-role only", () => {
        expect(sql).toMatch(/PRIMARY KEY \(run_id, unit_key\)/);
        expect(sql).toMatch(/ON CONFLICT \(run_id, unit_key\) DO NOTHING/);
        expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.aeo_release_run_unit[\s\S]*FROM PUBLIC, anon, authenticated/);
        expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.aeo_release_run_unit[\s\S]*TO service_role/);
        expect(sql).toMatch(/ALTER TABLE public\.aeo_run_skipped_units ENABLE ROW LEVEL SECURITY/);
        expect(sql).toMatch(/^-- apply-plan: with-code — /);
    });
});
