import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ client: vi.fn(), redisDel: vi.fn() }));

vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/db/redis", () => ({ redis: { del: m.redisDel } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createBusinessWithLocation } from "@/app/actions/onboarding/business";
import { updateBusinessAndLocation } from "@/app/actions/onboarding/business-update";

const B = "11111111-1111-4111-8111-111111111111";
const O = "22222222-2222-4222-8222-222222222222";
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

function insertChain(result: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
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
      from: vi.fn().mockReturnValueOnce(collision).mockReturnValueOnce(retry),
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
    m.client.mockResolvedValue({ from: vi.fn().mockReturnValue(failing), auth });

    const result = await updateBusinessAndLocation(B, { businessName: "Joe's Pizza" });

    expect(result.success).toBe(false);
    expect(failing.update).toHaveBeenCalledTimes(1);
  });
});

describe("createBusinessWithLocation slug handling", () => {
  it("retries with a suffixed slug when the derived one is taken", async () => {
    const collision = insertChain({ data: null, error: slugTaken });
    const retry = insertChain({
      data: { id: B, name: "Joe's Pizza", slug: "joe-s-pizza-ab12" },
      error: null,
    });
    const member = { upsert: vi.fn().mockResolvedValue({ error: null }) };
    m.client.mockResolvedValue({
      from: vi
        .fn()
        .mockReturnValueOnce(collision)
        .mockReturnValueOnce(retry)
        .mockReturnValueOnce(member),
      auth,
    });

    const result = await createBusinessWithLocation(O, {
      businessName: "Joe's Pizza",
      locationName: "Downtown",
      address: "123 Main St",
      city: "Austin",
      state: "TX",
      phone: "",
    } as Parameters<typeof createBusinessWithLocation>[1]);

    expect(result.success).toBe(true);
    expect(collision.insert).toHaveBeenCalledWith(expect.objectContaining({ slug: "joe-s-pizza" }));
    expect(retry.insert).toHaveBeenCalledWith(
      expect.objectContaining({ slug: expect.stringMatching(/^joe-s-pizza-[a-z0-9]+$/) }),
    );
  });
});
