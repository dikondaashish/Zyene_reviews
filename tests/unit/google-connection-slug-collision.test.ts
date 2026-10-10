import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
    client: vi.fn(),
    manage: vi.fn(),
    store: vi.fn(),
    enqueue: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/auth/manage-business-integration", () => ({
    canManageBusinessIntegration: m.manage,
}));
vi.mock("@/app/actions/onboarding/google-platform-credentials", () => ({
    storeGooglePlatformCredentials: m.store,
}));
vi.mock("@/app/actions/onboarding/types", () => ({
    enqueueGooglePostConnectSync: m.enqueue,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { finalizeVerifiedGoogleConnection } from "@/app/actions/onboarding/google-connection-finalize";
import type { GoogleLocationInput, GoogleTokenBundle } from "@/app/actions/onboarding/google-oauth-helpers";

const B = "11111111-1111-4111-8111-111111111111";

function makeUpdateChain(result: { error: unknown }) {
    return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(result),
    };
}

const location = {
    name: "locations/1545892228786783204",
    title: "Joe's Pizza",
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    category: "Restaurant",
} as unknown as GoogleLocationInput;

const tokens = { accessToken: "token", refreshToken: "r", expiresIn: 3600 } as unknown as GoogleTokenBundle;

beforeEach(() => {
    vi.resetAllMocks();
    m.manage.mockResolvedValue(true);
    m.store.mockResolvedValue({ ok: true, platformId: "platform-1" });
    m.enqueue.mockResolvedValue({ mode: "completed" });
    // finalize fetches a best-effort review summary; keep it offline and empty.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("finalizeVerifiedGoogleConnection slug handling", () => {
    it("keeps the existing slug when the derived slug is already taken by another business", async () => {
        const collision = makeUpdateChain({
            error: {
                code: "23505",
                message: 'duplicate key value violates unique constraint "businesses_slug_key"',
            },
        });
        const retry = makeUpdateChain({ error: null });
        m.client.mockResolvedValue({
            from: vi.fn().mockReturnValueOnce(collision).mockReturnValueOnce(retry),
            auth: { getUser: async () => ({ data: { user: { id: "u", email: "u@example.test" } } }) },
        });

        const result = await finalizeVerifiedGoogleConnection(B, location, tokens);

        expect(result.success).toBe(true);
        // First attempt includes the slug; the collision retry must not.
        expect(collision.update).toHaveBeenCalledWith(
            expect.objectContaining({ slug: "joe-s-pizza" }),
        );
        expect(retry.update).toHaveBeenCalledWith(
            expect.not.objectContaining({ slug: expect.anything() }),
        );
        // The rest of the Google details are still saved.
        expect(retry.update).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Joe's Pizza", city: "Austin" }),
        );
    });

    it("still fails the connection on a non-collision database error", async () => {
        const chain = makeUpdateChain({ error: { code: "42501", message: "RLS violation" } });
        m.client.mockResolvedValue({
            from: vi.fn().mockReturnValue(chain),
            auth: { getUser: async () => ({ data: { user: { id: "u", email: "u@example.test" } } }) },
        });

        const result = await finalizeVerifiedGoogleConnection(B, location, tokens);

        expect(result).toEqual({ success: false, error: "Failed to finalize connection" });
    });

    it("updates the slug when it is available", async () => {
        const chain = makeUpdateChain({ error: null });
        m.client.mockResolvedValue({
            from: vi.fn().mockReturnValue(chain),
            auth: { getUser: async () => ({ data: { user: { id: "u", email: "u@example.test" } } }) },
        });

        const result = await finalizeVerifiedGoogleConnection(B, location, tokens);

        expect(result.success).toBe(true);
        expect(chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ slug: "joe-s-pizza" }),
        );
    });
});
