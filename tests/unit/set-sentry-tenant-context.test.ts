import { beforeEach, describe, expect, it, vi } from "vitest";

const setUser = vi.fn();
const setTag = vi.fn();

vi.mock("@sentry/nextjs", () => ({
    setUser,
    setTag,
}));

describe("setSentryTenantContext", () => {
    beforeEach(() => {
        setUser.mockClear();
        setTag.mockClear();
    });

    it("sets user and tenant tags when ids are present", async () => {
        const { setSentryTenantContext } = await import("@/lib/monitoring/set-sentry-tenant-context");

        setSentryTenantContext({
            userId: "user_1",
            email: "owner@example.com",
            businessId: "biz_1",
            organizationId: "org_1",
        });

        expect(setUser).toHaveBeenCalledWith({ id: "user_1", email: "owner@example.com" });
        expect(setTag).toHaveBeenCalledWith("business_id", "biz_1");
        expect(setTag).toHaveBeenCalledWith("organization_id", "org_1");
    });

    it("clears the user when logged out", async () => {
        const { setSentryTenantContext } = await import("@/lib/monitoring/set-sentry-tenant-context");

        setSentryTenantContext({ userId: null, businessId: null, organizationId: null });
        expect(setUser).toHaveBeenCalledWith(null);
        expect(setTag).not.toHaveBeenCalled();
    });
});
