import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const m = vi.hoisted(() => ({ client: vi.fn(), manage: vi.fn(), store: vi.fn(), enqueue: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: m.manage }));
vi.mock("@/app/actions/onboarding/google-platform-credentials", () => ({ storeGooglePlatformCredentials: m.store }));
vi.mock("@/app/actions/onboarding/types", () => ({ enqueueGooglePostConnectSync: m.enqueue }));

import { updateBusinessAndLocation } from "@/app/actions/onboarding/business-update";
import { finalizeVerifiedGoogleConnection } from "@/app/actions/onboarding/google-connection-finalize";
import { isSignupPlaceholderSlug } from "@/services/onboarding/onboarding-business-slug";
import type { GoogleLocationInput, GoogleTokenBundle } from "@/app/actions/onboarding/google-oauth-helpers";

const B = "11111111-1111-4111-8111-111111111111";
const location = { name: "locations/1", title: "Joe's Pizza", city: "Austin", state: "TX" } as unknown as GoogleLocationInput;
const tokens = { accessToken: "t", refreshToken: "r", expiresIn: 3600 } as unknown as GoogleTokenBundle;

let db: FakeDb;
function seed(row: { name: string; slug: string | null }) {
    db = createFakeDb({ businesses: [{ id: B, ...row }] });
    const auth = { getUser: async () => ({ data: { user: { id: "u", email: "u@example.test" } } }) };
    m.client.mockResolvedValue(Object.assign(db.client, { auth }));
}
const stored = () => db.tables.businesses[0];

beforeEach(() => {
    vi.resetAllMocks();
    m.manage.mockResolvedValue(true);
    m.store.mockResolvedValue({ ok: true, platformId: null });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("x", { status: 503 })));
});
afterEach(() => vi.unstubAllGlobals());

describe("onboarding step 2 keeps a custom review link", () => {
    it("does not overwrite a slug the owner saved in step 3 when going back and continuing", async () => {
        seed({ name: "Joe's Pizza", slug: "joes-austin" });
        const result = await updateBusinessAndLocation(B, { businessName: "Joe's Pizza", city: "Austin" });
        expect(result).toMatchObject({ success: true, slug: "joes-austin" });
        expect(stored()).toMatchObject({ slug: "joes-austin", city: "Austin" });
    });

    it("replaces the signup placeholder slug with one from the real name", async () => {
        seed({ name: "Jane Doe's Business", slug: "jane-doe-aB3_x9" });
        const result = await updateBusinessAndLocation(B, { businessName: "Joe's Pizza" });
        expect(result).toMatchObject({ success: true, slug: "joe-s-pizza" });
        expect(stored()).toMatchObject({ name: "Joe's Pizza", slug: "joe-s-pizza" });
    });

    it("generates a slug when the business has none", async () => {
        seed({ name: "Joe's Pizza", slug: null });
        await updateBusinessAndLocation(B, { businessName: "Joe's Pizza" });
        expect(stored().slug).toBe("joe-s-pizza");
    });
});

describe("Google finalize keeps a custom review link", () => {
    it("does not overwrite a custom slug on reconnect", async () => {
        seed({ name: "Joe's Pizza", slug: "joes-austin" });
        const result = await finalizeVerifiedGoogleConnection(B, location, tokens);
        expect(result.success).toBe(true);
        expect(stored()).toMatchObject({ slug: "joes-austin", city: "Austin" });
    });

    it("replaces the signup placeholder slug", async () => {
        seed({ name: "Jane Doe's Business", slug: "jane-doe-Qw12er" });
        await finalizeVerifiedGoogleConnection(B, location, tokens);
        expect(stored().slug).toBe("joe-s-pizza");
    });
});

describe("isSignupPlaceholderSlug", () => {
    it("recognises signup and add-business placeholders only", () => {
        expect(isSignupPlaceholderSlug("Jane Doe's Business", "jane-doe-abc123")).toBe(true);
        expect(isSignupPlaceholderSlug("New's Business", "new-s-business-abc123")).toBe(true);
        expect(isSignupPlaceholderSlug("Jane Doe's Business", "jane-reviews")).toBe(false);
        expect(isSignupPlaceholderSlug("Joe's Pizza", "joe-s-pizza-abc123")).toBe(false);
        expect(isSignupPlaceholderSlug("Joe's Pizza", null)).toBe(true);
    });
});
