import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), email: vi.fn(), generate: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.email }));
vi.mock("@/services/aeo/reporting/generate-report", () => ({ generateStoredAeoReport: mocks.generate }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));
vi.mock("@/services/inngest/client", () => ({
    inngest: { createFunction: (_c: unknown, _t: unknown, handler: unknown) => ({ handler }) },
}));

import { aeoReportWorker } from "@/services/inngest/aeo/aeo-report-worker";

type Run = <T>(name: string, cb: () => Promise<T>) => Promise<T>;
type Ctx = { event: { data: { scheduleId: string } }; step: { run: Run } };
type Result = { skipped?: string; reportId?: string; sent?: number; failed?: number; advanced?: boolean };
const handler = (aeoReportWorker as unknown as { handler: (ctx: Ctx) => Promise<Result> }).handler;

const DUE = "2026-11-01T00:00:00.000Z";

/** Inngest-like run: memoises successful steps (JSON round-trip), a throw means retries are exhausted. */
function memoStep(crashOn?: string) {
    const done = new Map<string, unknown>();
    const names: string[] = [];
    const run: Run = async (name, cb) => {
        names.push(name);
        if (done.has(name)) return done.get(name) as never;
        if (name === crashOn) throw new Error(`crash in ${name}`);
        const value = await cb();
        const stored = value === undefined ? undefined : JSON.parse(JSON.stringify(value));
        done.set(name, stored);
        return stored as never;
    };
    return { run, done, names };
}

function seed(schedule: Record<string, unknown> = {}): FakeDb {
    const db = createFakeDb({
        aeo_report_schedules: [{
            id: "sch-1", organization_id: "org-1", business_id: "biz-1", cadence: "weekly",
            recipients: ["a@x.test", "B@x.test", "b@x.test", "c@x.test"], enabled: true, next_send_at: DUE, ...schedule,
        }],
        aeo_reports: [],
        businesses: [{ id: "biz-1", name: "Biz" }],
        organizations: [{ id: "org-1", name: "Agency", aeo_sender_domain: null, aeo_sender_domain_status: "unverified" }],
    });
    const storage = { from: () => ({ download: async () => ({ data: new Blob(["%PDF"]), error: null }) }) };
    Object.assign(db.client, { storage });
    mocks.generate.mockImplementation(async () => {
        const row = {
            id: `rep-${db.tables.aeo_reports.length + 1}`, schedule_id: "sch-1", storage_path: "org-1/biz-1/r.pdf",
            html: "<p>r</p>", delivery_status: "generated", sent_at: null, error_message: null, created_at: new Date().toISOString(),
        };
        db.tables.aeo_reports.push(row);
        return { reportId: row.id, path: row.storage_path, html: row.html, pdf: Buffer.alloc(5_000_000),
            model: { businessName: "Biz", brandName: "Agency", senderDomain: null, senderDomainVerified: false } };
    });
    mocks.admin.mockReturnValue(db.client);
    return db;
}

const schedule = (db: FakeDb) => db.tables.aeo_report_schedules[0];
const ctx = (step: { run: Run }): Ctx => ({ event: { data: { scheduleId: "sch-1" } }, step });
const sentTo = () => mocks.email.mock.calls.map((c) => (c[0] as { to: string }).to);

beforeEach(() => {
    vi.resetAllMocks();
});

describe("aeo report worker occurrence", () => {
    it("advances the schedule when one recipient fails permanently and records the failure", async () => {
        const db = seed();
        mocks.email.mockImplementation(async ({ to }: { to: string }) =>
            to === "b@x.test" ? { sent: false, error: "invalid recipient" } : { sent: true, id: "e" });
        const result = await handler(ctx(memoStep()));
        expect(result).toMatchObject({ sent: 2, failed: 1 });
        expect(sentTo()).toEqual(["a@x.test", "b@x.test", "c@x.test"]);
        expect(Date.parse(String(schedule(db).next_send_at))).toBeGreaterThan(Date.now());
        expect(db.tables.aeo_reports[0]).toMatchObject({ delivery_status: "sent", error_message: "Delivery failed for: b@x.test" });
        const keys = mocks.email.mock.calls.map((c) => (c[0] as { idempotencyKey: string }).idempotencyKey);
        expect(keys).toEqual(["aeo-report/rep-1/a@x.test", "aeo-report/rep-1/b@x.test", "aeo-report/rep-1/c@x.test"]);
    });

    it("never regenerates or re-mails when a stuck occurrence is re-queued by a later cron", async () => {
        const db = seed();
        mocks.email.mockResolvedValue({ sent: true, id: "e" });
        await expect(handler(ctx(memoStep("complete-schedule")))).rejects.toThrow(/crash/);
        expect(sentTo()).toHaveLength(3);
        // Next day: fresh event, fresh step memo, schedule still due.
        const result = await handler(ctx(memoStep()));
        expect(mocks.generate).toHaveBeenCalledTimes(1);
        expect(db.tables.aeo_reports).toHaveLength(1);
        expect(sentTo()).toHaveLength(3);
        expect(result).toMatchObject({ reportId: "rep-1", sent: 0 });
        expect(Date.parse(String(schedule(db).next_send_at))).toBeGreaterThan(Date.now());
    });

    it("keeps step output small: the generate step returns a reference, not the PDF", async () => {
        seed();
        mocks.email.mockResolvedValue({ sent: true, id: "e" });
        const step = memoStep();
        await handler(ctx(step));
        const output = JSON.stringify(step.done.get("generate-report"));
        expect(output.length).toBeLessThan(1_000);
        expect(output).not.toContain("pdf\":");
        expect(step.names.filter((n) => n.startsWith("send-report-"))).toEqual(["send-report-0", "send-report-1", "send-report-2"]);
    });

    it("advances org-only schedules instead of leaving them due forever", async () => {
        const db = seed({ business_id: null });
        const result = await handler(ctx(memoStep()));
        expect(result).toEqual({ skipped: "org_only" });
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(Date.parse(String(schedule(db).next_send_at))).toBeGreaterThan(Date.now());
    });

    it("skips a re-queued event once the occurrence already advanced", async () => {
        seed({ next_send_at: "2999-01-01T00:00:00.000Z" });
        await expect(handler(ctx(memoStep()))).resolves.toEqual({ skipped: "not_due" });
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(mocks.email).not.toHaveBeenCalled();
    });
    it("retries the same report next cron when every recipient failed (systemic outage)", async () => {
        const recent = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const db = seed({ next_send_at: recent });
        mocks.email.mockResolvedValue({ sent: false, error: "Resend 503" });
        const first = await handler(ctx(memoStep()));
        expect(first).toMatchObject({ sent: 0, failed: 3, advanced: false });
        expect(schedule(db).next_send_at).toBe(recent);
        expect(db.tables.aeo_reports[0]).toMatchObject({ delivery_status: "generated", sent_at: null });
        // Outage over: next daily cron reuses the stored report and delivers to everyone.
        mocks.email.mockResolvedValue({ sent: true, id: "e" });
        const second = await handler(ctx(memoStep()));
        expect(second).toMatchObject({ reportId: "rep-1", sent: 3, failed: 0, advanced: true });
        expect(mocks.generate).toHaveBeenCalledTimes(1);
        expect(db.tables.aeo_reports).toHaveLength(1);
        expect(db.tables.aeo_reports[0]).toMatchObject({ delivery_status: "sent" });
        expect(Date.parse(String(schedule(db).next_send_at))).toBeGreaterThan(Date.now());
    });

    it("gives up and advances once an undelivered occurrence is past its retry window", async () => {
        const db = seed();
        mocks.email.mockResolvedValue({ sent: false, error: "invalid recipient" });
        const result = await handler(ctx(memoStep()));
        expect(result).toMatchObject({ sent: 0, failed: 3, advanced: true });
        expect(db.tables.aeo_reports[0]).toMatchObject({ delivery_status: "failed" });
        expect(Date.parse(String(schedule(db).next_send_at))).toBeGreaterThan(Date.now());
    });
});
