import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import { loadActiveNewsletterSubscribers } from "@/services/cron/newsletter-subscribers";

function fakeAdmin(total: number) {
  const all = Array.from({ length: total }, (_, i) => ({
    id: `sub-${String(i).padStart(5, "0")}`,
    email: `s${i}@example.com`,
  }));
  const calls = { order: vi.fn(), range: vi.fn(), is: vi.fn() };
  const builder = {
    select: () => builder,
    is: (...args: unknown[]) => {
      calls.is(...args);
      return builder;
    },
    order: (...args: unknown[]) => {
      calls.order(...args);
      return builder;
    },
    range: async (from: number, to: number) => {
      calls.range(from, to);
      // PostgREST default: never more than 1000 rows per response.
      const end = Math.min(to + 1, from + 1000);
      return { data: all.slice(from, end), error: null };
    },
  };
  const admin = { from: () => builder } as unknown as SupabaseClient;
  return { admin, calls };
}

describe("loadActiveNewsletterSubscribers", () => {
  it("loads subscribers beyond the 1000-row PostgREST cap", async () => {
    const { admin, calls } = fakeAdmin(2345);
    const subscribers = await loadActiveNewsletterSubscribers(admin);

    expect(subscribers).toHaveLength(2345);
    expect(new Set(subscribers.map((s) => s.id)).size).toBe(2345);
    expect(calls.is).toHaveBeenCalledWith("unsubscribed_at", null);
    expect(calls.order).toHaveBeenCalledWith("id", { ascending: true });
    expect(calls.range.mock.calls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
  });

  it("stops after an exactly-full last page with one empty read", async () => {
    const { admin, calls } = fakeAdmin(1000);
    const subscribers = await loadActiveNewsletterSubscribers(admin);
    expect(subscribers).toHaveLength(1000);
    expect(calls.range).toHaveBeenCalledTimes(2);
  });

  it("throws when a page fails to load", async () => {
    const builder = {
      select: () => builder,
      is: () => builder,
      order: () => builder,
      range: async () => ({ data: null, error: { message: "boom" } }),
    };
    const admin = { from: () => builder } as unknown as SupabaseClient;
    await expect(loadActiveNewsletterSubscribers(admin)).rejects.toThrow(
      "Unable to load newsletter subscribers",
    );
  });
});
