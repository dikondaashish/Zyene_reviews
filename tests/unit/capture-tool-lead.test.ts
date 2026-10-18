import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), upsert: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));

import { captureToolLead } from "@/lib/free-tools/capture-tool-lead";

describe("captureToolLead", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.upsert.mockResolvedValue({ error: null });
        mocks.admin.mockReturnValue({ from: vi.fn(() => ({ upsert: mocks.upsert })) });
    });

    it("never re-subscribes an existing email", async () => {
        const result = await captureToolLead({ email: " User@Example.com ", source: "review_link_generator" });
        expect(result).toEqual({ ok: true });
        const [row, options] = mocks.upsert.mock.calls[0];
        expect(options).toEqual({ onConflict: "email", ignoreDuplicates: true });
        expect(row).not.toHaveProperty("unsubscribed_at");
        expect(row).toMatchObject({
            email: "user@example.com",
            source: "review_link_generator",
            utm_source: "free_tool",
            utm_medium: "review_link_generator",
        });
    });

    it("rejects invalid emails without touching the database", async () => {
        const result = await captureToolLead({ email: "nope", source: "x" });
        expect(result.ok).toBe(false);
        expect(mocks.admin).not.toHaveBeenCalled();
    });

    it("returns an error when the insert fails", async () => {
        mocks.upsert.mockResolvedValue({ error: { message: "boom" } });
        const result = await captureToolLead({ email: "a@b.co", source: "x" });
        expect(result).toEqual({ ok: false, error: "Could not save your email" });
    });
});
