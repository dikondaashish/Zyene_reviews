import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Minimal in-memory Supabase query builder for unit tests. Implements the filters the
 * review-request guard, ledger and dispatchers use, plus unique constraints (23505) so
 * claim logic is exercised for real rather than mocked.
 */
type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;

export type FakeDb = {
    tables: Record<string, Row[]>;
    unique: Record<string, string[][]>;
    client: SupabaseClient;
};

let idCounter = 0;
const nextId = () => `00000000-0000-4000-8000-${String(++idCounter).padStart(12, "0")}`;

export function createFakeDb(tables: Record<string, Row[]> = {}, unique: Record<string, string[][]> = {}): FakeDb {
    const db: FakeDb = { tables, unique, client: null as unknown as SupabaseClient };
    db.client = { from: (table: string) => new Query(db, table) } as unknown as SupabaseClient;
    return db;
}

class Query {
    private filters: Filter[] = [];
    private op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
    private payload: Row[] = [];
    private patch: Row = {};
    private limitN: number | null = null;
    private headCount = false;
    private upsertOpts: { onConflict?: string; ignoreDuplicates?: boolean } = {};

    constructor(private db: FakeDb, private table: string) {
        db.tables[table] ??= [];
    }
    select(_cols?: string, opts?: { count?: string; head?: boolean }) { if (opts?.head) this.headCount = true; return this; }
    insert(rows: Row | Row[]) { this.op = "insert"; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
    upsert(rows: Row | Row[], opts: { onConflict?: string; ignoreDuplicates?: boolean } = {}) {
        this.op = "upsert"; this.payload = Array.isArray(rows) ? rows : [rows]; this.upsertOpts = opts; return this;
    }
    update(patch: Row) { this.op = "update"; this.patch = patch; return this; }
    delete() { this.op = "delete"; return this; }
    eq(col: string, val: unknown) { this.filters.push((r) => r[col] === val); return this; }
    neq(col: string, val: unknown) { this.filters.push((r) => r[col] !== val); return this; }
    in(col: string, vals: unknown[]) { this.filters.push((r) => vals.includes(r[col])); return this; }
    is(col: string, val: null) { this.filters.push((r) => (r[col] ?? null) === val); return this; }
    lt(col: string, val: number | string) { this.filters.push((r) => r[col] != null && (r[col] as number | string) < val); return this; }
    lte(col: string, val: number | string) { this.filters.push((r) => r[col] != null && (r[col] as number | string) <= val); return this; }
    gte(col: string, val: number | string) { this.filters.push((r) => r[col] != null && (r[col] as number | string) >= val); return this; }
    ilike(col: string, val: string) { this.filters.push((r) => String(r[col] ?? "").toLowerCase() === val.toLowerCase()); return this; }
    not(col: string, op: string, val: unknown) {
        if (op === "in") { const list = String(val).replace(/[()]/g, "").split(","); this.filters.push((r) => !list.includes(String(r[col]))); }
        if (op === "is") this.filters.push((r) => (r[col] ?? null) !== val);
        return this;
    }
    or(expr: string) {
        // Supports "a.is.null,a.lte.<iso>" style used by the scheduled claim.
        const parts = expr.split(",").map((p) => p.split("."));
        this.filters.push((r) => parts.some(([col, op, ...rest]) => {
            const v = rest.join(".");
            if (op === "is") return (r[col] ?? null) === null;
            if (op === "lte") return r[col] != null && String(r[col]) <= v;
            return false;
        }));
        return this;
    }
    order() { return this; }
    limit(n: number) { this.limitN = n; return this; }
    single() { return this.run().then((res) => ({ ...res, data: Array.isArray(res.data) ? res.data[0] ?? null : res.data, error: res.error ?? (Array.isArray(res.data) && !res.data.length ? { code: "PGRST116" } : null) })); }
    maybeSingle() { return this.run().then((res) => ({ ...res, data: Array.isArray(res.data) ? res.data[0] ?? null : res.data })); }
    then<T>(resolve: (value: { data: unknown; error: unknown; count?: number }) => T, reject?: (e: unknown) => T) { return this.run().then(resolve, reject); }

    private rows() { return this.db.tables[this.table]; }
    private matches() { return this.rows().filter((r) => this.filters.every((f) => f(r))); }
    private violates(row: Row, ignore?: Row) {
        return (this.db.unique[this.table] ?? []).some((cols) => this.rows().some((r) => r !== ignore && cols.every((c) => r[c] != null && r[c] === row[c])));
    }

    private async run(): Promise<{ data: unknown; error: { code?: string; message?: string } | null; count?: number }> {
        if (this.op === "select") {
            const found = this.matches();
            const limited = this.limitN == null ? found : found.slice(0, this.limitN);
            return { data: this.headCount ? null : limited.map((r) => ({ ...r })), error: null, count: found.length };
        }
        if (this.op === "insert" || this.op === "upsert") {
            const out: Row[] = [];
            for (const raw of this.payload) {
                const row: Row = { id: nextId(), ...raw };
                if (this.violates(row)) {
                    if (this.op === "upsert" && this.upsertOpts.ignoreDuplicates) continue;
                    if (this.op === "upsert") {
                        const keys = (this.upsertOpts.onConflict ?? "id").split(",");
                        const existing = this.rows().find((r) => keys.every((k) => r[k] === row[k]));
                        if (existing) { Object.assign(existing, raw); out.push({ ...existing }); continue; }
                    }
                    return { data: null, error: { code: "23505", message: "duplicate key" } };
                }
                this.rows().push(row);
                out.push({ ...row });
            }
            return { data: out, error: null };
        }
        if (this.op === "update") {
            const targets = this.matches();
            for (const t of targets) Object.assign(t, this.patch);
            return { data: targets.map((r) => ({ ...r })), error: null };
        }
        const doomed = this.matches();
        this.db.tables[this.table] = this.rows().filter((r) => !doomed.includes(r));
        return { data: doomed, error: null };
    }
}
