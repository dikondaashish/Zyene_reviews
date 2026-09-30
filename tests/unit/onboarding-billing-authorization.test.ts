import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/services/stripe/client", () => ({ stripe: {} }));

import { savePlanSelection } from "@/app/actions/onboarding/billing";

function mockClient(membership: { role: string } | null) {
  const queries: Array<{ table: string; filters: Record<string, string>; update?: unknown }> = [];
  const from = vi.fn((table: string) => {
    const query: { table: string; filters: Record<string, string>; update?: unknown } = {
      table, filters: {},
    };
    queries.push(query);
    const builder = {
      select: () => builder,
      eq: (key: string, value: string) => {
        query.filters[key] = value;
        return builder;
      },
      maybeSingle: async () => ({ data: membership, error: null }),
      update: (value: unknown) => {
        query.update = value;
        return builder;
      },
      then: (resolve: (value: unknown) => void) => resolve({ error: null }),
    };
    return builder;
  });
  mocks.createClient.mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: "user-a" } } }) },
    from,
  });
  return queries;
}

describe("onboarding billing authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a foreign organization without writing any row", async () => {
    const queries = mockClient(null);
    expect(await savePlanSelection("org-b", { plan: "none" })).toMatchObject({ success: false });
    expect(queries).toEqual([{ table: "organization_members", filters: {
      organization_id: "org-b", user_id: "user-a", status: "active",
    } }]);
  });

  it("rejects an owner's forged paid plan", async () => {
    const queries = mockClient({ role: "ORG_OWNER" });
    expect(await savePlanSelection("org-a", { plan: "pro" } as never)).toMatchObject({ success: false });
    expect(queries).toEqual([]);
  });

  it("completes the skip step without changing entitlements", async () => {
    const queries = mockClient({ role: "ORG_OWNER" });
    expect(await savePlanSelection("org-a", { plan: "none" })).toMatchObject({ success: true });
    expect(queries.map((query) => query.table)).toEqual(["organization_members", "users"]);
    expect(queries[1].update).toEqual({ onboarding_step: 5 });
  });

  it("limits direct client writes to non-billing organization columns", () => {
    const sql = readFileSync(join(process.cwd(),
      "supabase/migrations/20260929232000_protect_organization_billing_columns.sql"), "utf8");
    expect(sql).toMatch(/REVOKE UPDATE ON public\.organizations FROM PUBLIC, anon, authenticated/i);
    expect(sql).toMatch(/GRANT UPDATE \(name, slug, updated_at\) ON public\.organizations TO authenticated/i);
    expect(sql).toMatch(/REVOKE INSERT ON public\.organizations FROM PUBLIC, anon, authenticated/i);
    expect(sql).toMatch(/GRANT INSERT \(name, slug, type\) ON public\.organizations TO authenticated/i);
    expect(sql).not.toMatch(/GRANT (?:INSERT|UPDATE) \([^)]*(?:plan|stripe_|max_)/i);
  });
});
