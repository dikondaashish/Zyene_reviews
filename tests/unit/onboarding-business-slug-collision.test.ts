import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ client: vi.fn(), redisDel: vi.fn() }));

vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/db/redis", () => ({ redis: { del: m.redisDel } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import * as businessActions from "@/app/actions/onboarding/business";
import { updateBusinessAndLocation } from "@/app/actions/onboarding/business-update";

const B = "11111111-1111-4111-8111-111111111111";
const slugTaken = {
  code: "23505",
  message: 'duplicate key value violates unique constraint "businesses_slug_key"',
};
const auth = { getUser: async () => ({ data: { user: { id: "u" } } }) };

/** update().eq().select("slug"): the saved slug comes back so the next step can show the review link. */
function updateChain(result: { error: unknown; data?: Array<{ slug: string }> | null }) {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue({ data: null, ...result }),
  };
}

/** The current row: still on its signup placeholder, so step 2 may generate a slug. */
function readChain() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { name: "Jane's Business", slug: "jane-abc123" }, error: null }),
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  m.redisDel.mockResolvedValue(1);
});

describe("updateBusinessAndLocation slug handling", () => {
  it("keeps the existing slug when another business owns the derived one", async () => {
    const collision = updateChain({ error: slugTaken });
    const retry = updateChain({ error: null, data: [{ slug: "joes-old-slug" }] });
    m.client.mockResolvedValue({
      from: vi.fn().mockReturnValueOnce(readChain()).mockReturnValueOnce(collision).mockReturnValueOnce(retry),
      auth,
    });

    const result = await updateBusinessAndLocation(B, { businessName: "Joe's Pizza" });

    expect(result.success).toBe(true);
    expect(result).toMatchObject({ slug: "joes-old-slug" });
    expect(collision.update).toHaveBeenCalledWith(expect.objectContaining({ slug: "joe-s-pizza" }));
    expect(retry.update).toHaveBeenCalledWith(expect.not.objectContaining({ slug: expect.anything() }));
    expect(retry.update).toHaveBeenCalledWith(expect.objectContaining({ name: "Joe's Pizza" }));
  });

  it("still fails on other database errors", async () => {
    const failing = updateChain({ error: { code: "42501", message: "permission denied" } });
    m.client.mockResolvedValue({ from: vi.fn().mockReturnValueOnce(readChain()).mockReturnValue(failing), auth });

    const result = await updateBusinessAndLocation(B, { businessName: "Joe's Pizza" });

    expect(result.success).toBe(false);
    expect(failing.update).toHaveBeenCalledTimes(1);
  });
});

describe("removed createBusinessWithLocation action", () => {
  // It inserted businesses with no plan-limit or role check and had no callers.
  // The onboarding barrel re-exports this module with `export *`, so this covers it too.
  it("is no longer exported as a callable server action", () => {
    expect("createBusinessWithLocation" in businessActions).toBe(false);
  });
});
