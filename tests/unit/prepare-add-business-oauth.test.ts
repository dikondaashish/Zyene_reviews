import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(),
    getActiveBusinessId: vi.fn(),
    beginAddBusinessOAuth: vi.fn(),
    canAddBusinessToOrganization: vi.fn(),
}));

vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/business-context", () => ({
    getActiveBusinessId: mocks.getActiveBusinessId,
}));
vi.mock("@/services/auth/add-business-oauth-cookie", () => ({
    beginAddBusinessOAuth: mocks.beginAddBusinessOAuth,
}));
vi.mock("@/services/auth/add-business-authorization", () => ({
    canAddBusinessToOrganization: mocks.canAddBusinessToOrganization,
}));

import { prepareAddBusinessGoogleOAuth } from "@/app/(dashboard)/businesses/add/actions";

describe("add-business OAuth initiation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.createClient.mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-a" } } }) },
        });
        mocks.getActiveBusinessId.mockResolvedValue({ organization: { id: "org-a" } });
        mocks.canAddBusinessToOrganization.mockResolvedValue(true);
        mocks.beginAddBusinessOAuth.mockResolvedValue("random-state");
    });

    it("returns only an opaque state in the callback URL", async () => {
        const result = await prepareAddBusinessGoogleOAuth();
        const redirect = new URL(result.redirectTo!);

        expect(redirect.searchParams.get("add_business_state")).toBe("random-state");
        expect(redirect.searchParams.has("add_user")).toBe(false);
        expect(redirect.searchParams.has("add_org")).toBe(false);
        expect(mocks.beginAddBusinessOAuth).toHaveBeenCalledWith("user-a", "org-a");
    });

    it("denies a user without add-business membership before creating state", async () => {
        mocks.canAddBusinessToOrganization.mockResolvedValue(false);

        const result = await prepareAddBusinessGoogleOAuth();

        expect(result.redirectTo).toBeUndefined();
        expect(mocks.beginAddBusinessOAuth).not.toHaveBeenCalled();
    });
});
