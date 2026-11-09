import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/db/supabase/database.types";
import { createFakeDb } from "./helpers/fake-supabase";

vi.mock("@/services/google/sync-service", () => ({
    getValidGoogleToken: vi.fn(async () => ({ accessToken: "token" })),
}));
vi.mock("@/services/google/listing-information", () => ({
    getGoogleLocation: vi.fn(async () => ({
        categories: { primaryCategory: { displayName: "Plumber" } },
        storefrontAddress: { locality: "Austin" },
    })),
}));

import { activateDefaultPrompts } from "@/services/aeo/prompts/activate-default-prompts";
import { autoEnrollDefaultPrompts } from "@/services/aeo/prompts/auto-enroll-default-prompts";
import { PROMPT_CHOICE_COLUMN } from "@/services/aeo/prompts/prompt-enrollment-history";
import { loadDuePromptEnrollmentBusinesses } from "@/services/aeo/scheduler/load-due-prompt-enrollment-businesses";

type Db = SupabaseClient<Database>;
type Row = Record<string, unknown>;

const BIZ = "biz-1";

function seed(extra: Record<string, Row[]> = {}, business: Row = {}) {
    return createFakeDb(
        {
            businesses: [{ id: BIZ, name: "Acme Plumbing", city: "Austin", organization_id: "org-1", ...business }],
            review_platforms: [{ id: "rp-1", business_id: BIZ, platform: "google", google_location_id: "loc-1" }],
            ...extra,
        },
        { aeo_prompt_clusters: [["business_id", "name"]] }
    );
}

const activeCount = (rows: Row[] = []) => rows.filter((row) => row.business_id === BIZ && row.is_active).length;

describe("autoEnrollDefaultPrompts — owner choice is durable", () => {
    beforeEach(() => vi.clearAllMocks());

    it("enrols a business that has never had a prompt library", async () => {
        const fake = seed();
        const result = await autoEnrollDefaultPrompts(fake.client as Db, BIZ);
        expect(result.skipped).toBeNull();
        expect(result.activated).toBeGreaterThan(0);
        expect(activeCount(fake.tables.aeo_prompts)).toBe(result.activated);
    });

    it("never re-enrols once the choice marker is set (owner deleted every manual prompt)", async () => {
        const fake = seed({}, { [PROMPT_CHOICE_COLUMN]: "2026-11-01T00:00:00Z" });
        const result = await autoEnrollDefaultPrompts(fake.client as Db, BIZ);
        expect(result).toEqual({ activated: 0, skipped: "existing_prompt_history" });
        expect(fake.tables.aeo_prompts ?? []).toHaveLength(0);
    });

    it("never re-activates defaults for an owner who paused every prompt", async () => {
        const fake = seed({
            aeo_prompts: [{
                id: "p-1", business_id: BIZ, prompt_text: "best plumber in Austin", source: "suggested",
                is_active: false, created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-05T00:00:00Z",
            }],
        });
        const result = await autoEnrollDefaultPrompts(fake.client as Db, BIZ);
        expect(result).toEqual({ activated: 0, skipped: "existing_prompt_history" });
        expect(activeCount(fake.tables.aeo_prompts)).toBe(0);
    });

    it("skips a business that has already run sampling", async () => {
        const fake = seed({ aeo_runs: [{ id: "run-1", business_id: BIZ }] });
        const result = await autoEnrollDefaultPrompts(fake.client as Db, BIZ);
        expect(result.skipped).toBe("existing_prompt_history");
    });

    it("finishes on retry after its own partial write (clusters + inert suggestions, no marker)", async () => {
        const fake = seed({
            aeo_prompt_clusters: [{ id: "c-1", business_id: BIZ, name: "Discovery" }],
            aeo_prompts: [{
                id: "s-1", business_id: BIZ, prompt_text: "best plumber in Austin", source: "suggested",
                is_active: false, created_at: "2026-11-09T01:00:00Z", updated_at: "2026-11-09T01:00:00Z",
            }],
        });
        const result = await autoEnrollDefaultPrompts(fake.client as Db, BIZ);
        expect(result.skipped).toBeNull();
        expect(result.activated).toBeGreaterThan(0);
    });
});

describe("activateDefaultPrompts — never flips a paused prompt back on", () => {
    it("skips a suggestion row the owner has toggled before", async () => {
        const fake = createFakeDb({
            aeo_prompts: [
                { id: "paused", business_id: BIZ, prompt_text: "best plumber in Austin", source: "suggested", is_active: false, created_at: "t1", updated_at: "t2" },
                { id: "fresh", business_id: BIZ, prompt_text: "emergency plumber Austin", source: "suggested", is_active: false, created_at: "t3", updated_at: "t3" },
                { id: "manual", business_id: BIZ, prompt_text: "plumber near me", source: "manual", is_active: false, created_at: "t4", updated_at: "t4" },
            ],
        });
        const defaults = ["best plumber in Austin", "emergency plumber Austin", "plumber near me"].map((promptText) => ({
            promptText, intent: "discovery", clusterName: "Discovery", localeCity: "Austin",
        })) as unknown as Parameters<typeof activateDefaultPrompts>[2];

        const result = await activateDefaultPrompts(fake.client as Db, BIZ, defaults);
        expect(result.activated).toBe(1);
        const byId = new Map(fake.tables.aeo_prompts.map((row) => [row.id, row.is_active]));
        expect(byId.get("paused")).toBe(false);
        expect(byId.get("manual")).toBe(false);
        expect(byId.get("fresh")).toBe(true);
    });
});

/** Minimal PostgREST-like fake that honours `.range()` and caps every page at 1000 rows. */
function pagedDb(tables: Record<string, Row[]>, opts: { missingColumn?: boolean } = {}) {
    const queried: string[] = [];
    const from = (table: string) => {
        queried.push(table);
        const filters: ((row: Row) => boolean)[] = [];
        let window: [number, number] | null = null;
        let missing = false;
        const run = () => {
            if (missing) return Promise.resolve({ data: null, error: { message: `column businesses.${PROMPT_CHOICE_COLUMN} does not exist` } });
            const rows = (tables[table] ?? []).filter((row) => filters.every((f) => f(row)));
            const [start, end] = window ?? [0, rows.length - 1];
            return Promise.resolve({ data: rows.slice(start, Math.min(end + 1, start + 1000)), error: null });
        };
        const query = {
            select: () => query,
            eq: (col: string, val: unknown) => { filters.push((row) => row[col] === val); return query; },
            in: (col: string, vals: unknown[]) => { filters.push((row) => vals.includes(row[col])); return query; },
            is: (col: string, val: null) => {
                if (opts.missingColumn && col === PROMPT_CHOICE_COLUMN) missing = true;
                filters.push((row) => (row[col] ?? null) === val);
                return query;
            },
            order: () => query,
            range: (start: number, end: number) => { window = [start, end]; return query; },
            then: <T>(resolve: (value: { data: Row[] | null; error: { message: string } | null }) => T) => run().then(resolve),
        };
        return query;
    };
    return { db: { from } as unknown as Db, queried };
}

describe("loadDuePromptEnrollmentBusinesses", () => {
    const org = { id: "org-1", plan: "starter_monthly", plan_status: "active" };
    const base = { organizations: [org], aeo_credit_balances: [{ organization_id: "org-1" }] };

    it("returns only businesses without the owner-choice marker, without scanning prompt libraries", async () => {
        const { db, queried } = pagedDb({
            ...base,
            businesses: [
                { id: "new-biz", organization_id: "org-1" },
                { id: "chose-biz", organization_id: "org-1", [PROMPT_CHOICE_COLUMN]: "2026-11-01T00:00:00Z" },
            ],
        });
        expect(await loadDuePromptEnrollmentBusinesses(db)).toEqual([{ businessId: "new-biz", organizationId: "org-1" }]);
        expect(queried).not.toContain("aeo_prompts");
        expect(queried).not.toContain("aeo_prompt_clusters");
    });

    it("pages past the 1000-row cap when reading businesses", async () => {
        const businesses = Array.from({ length: 1500 }, (_, i) => ({ id: `b-${String(i).padStart(4, "0")}`, organization_id: "org-1" }));
        const { db } = pagedDb({ ...base, businesses });
        expect(await loadDuePromptEnrollmentBusinesses(db)).toHaveLength(1500);
    });

    it("skips enrollment (does not throw) until the marker migration is applied", async () => {
        const { db } = pagedDb({ ...base, businesses: [{ id: "new-biz", organization_id: "org-1" }] }, { missingColumn: true });
        await expect(loadDuePromptEnrollmentBusinesses(db)).resolves.toEqual([]);
    });
});

describe("aeo_prompt_choice marker migration", () => {
    const sql = readFileSync(
        join(process.cwd(), "supabase/migrations/20261109120000_aeo_prompt_choice_marker.sql"),
        "utf8"
    );

    it("adds the column the code reads and stamps it on delete, toggle and non-suggestion insert", () => {
        expect(sql).toContain(`ADD COLUMN IF NOT EXISTS ${PROMPT_CHOICE_COLUMN}`);
        expect(sql).toMatch(/AFTER INSERT OR DELETE OR UPDATE OF is_active ON public\.aeo_prompts/);
        expect(sql).toMatch(/NEW\.source = 'suggested' AND NOT NEW\.is_active/);
        expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = ''/);
        expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.mark_aeo_prompt_choice\(\)\s+FROM PUBLIC, anon, authenticated/);
    });
});
