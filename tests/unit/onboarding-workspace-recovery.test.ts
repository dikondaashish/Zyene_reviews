import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

import { recoverOnboardingWorkspace } from "@/services/auth/recover-onboarding-workspace";

const USER = { id: "22222222-2222-4222-8222-222222222222", email: "sam@example.com", fullName: "Sam" };

describe("recoverOnboardingWorkspace", () => {
    let db: FakeDb;
    beforeEach(() => {
        db = createFakeDb({ users: [{ id: USER.id, email: USER.email }] }, { users: [["id"]] });
    });

    it("creates the missing organization, business and owner memberships", async () => {
        const res = await recoverOnboardingWorkspace(db.client, USER);
        expect(res).toEqual({ success: true, repaired: true });
        expect(db.tables.organizations).toHaveLength(1);
        expect(db.tables.businesses).toMatchObject([{ organization_id: db.tables.organizations[0].id }]);
        expect(db.tables.organization_members).toMatchObject([{ user_id: USER.id, role: "ORG_OWNER" }]);
        expect(db.tables.business_members).toMatchObject([{ user_id: USER.id, role: "owner" }]);
    });

    it("is idempotent: a second call changes nothing", async () => {
        await recoverOnboardingWorkspace(db.client, USER);
        const again = await recoverOnboardingWorkspace(db.client, USER);
        expect(again).toEqual({ success: true, repaired: false });
        expect(db.tables.organizations).toHaveLength(1);
        expect(db.tables.businesses).toHaveLength(1);
    });

    it("adds only a business when the owner already has an organization", async () => {
        db.tables.organizations = [{ id: "org-1", slug: "sam-org" }];
        db.tables.organization_members = [{ organization_id: "org-1", user_id: USER.id, role: "ORG_OWNER" }];
        const res = await recoverOnboardingWorkspace(db.client, USER);
        expect(res).toEqual({ success: true, repaired: true });
        expect(db.tables.organizations).toHaveLength(1);
        expect(db.tables.businesses).toMatchObject([{ organization_id: "org-1" }]);
        expect(db.tables.business_members).toMatchObject([{ user_id: USER.id, role: "owner" }]);
    });

    it("never creates a business for a non-owner organization member", async () => {
        db.tables.organization_members = [{ organization_id: "org-1", user_id: USER.id, role: "ORG_MEMBER" }];
        const res = await recoverOnboardingWorkspace(db.client, USER);
        expect(res.success).toBe(false);
        expect(db.tables.businesses ?? []).toHaveLength(0);
    });

    it("never gives an invited teammate a new organization", async () => {
        db.tables.business_members = [{ business_id: "biz-other", user_id: USER.id, role: "member" }];
        const res = await recoverOnboardingWorkspace(db.client, USER);
        expect(res.success).toBe(false);
        expect(db.tables.organizations ?? []).toHaveLength(0);
    });

    it("re-links an owner whose own organization lost its membership row", async () => {
        db.tables.organizations = [{ id: "org-own", slug: "sam" }];
        db.tables.businesses = [{ id: "biz-own", organization_id: "org-own" }];
        db.tables.business_members = [{ business_id: "biz-own", user_id: USER.id, role: "owner" }];
        const res = await recoverOnboardingWorkspace(db.client, USER);
        expect(res).toEqual({ success: true, repaired: true });
        expect(db.tables.organization_members).toMatchObject([
            { organization_id: "org-own", user_id: USER.id, role: "ORG_OWNER" },
        ]);
        expect(db.tables.organizations).toHaveLength(1);
    });

    it("does not adopt a business whose organization already has members", async () => {
        db.tables.businesses = [{ id: "biz-other", organization_id: "org-other" }];
        db.tables.business_members = [{ business_id: "biz-other", user_id: USER.id, role: "owner" }];
        db.tables.organization_members = [{ organization_id: "org-other", user_id: "someone-else", role: "ORG_OWNER" }];
        const res = await recoverOnboardingWorkspace(db.client, USER);
        expect(res.success).toBe(false);
        expect(db.tables.organization_members).toHaveLength(1);
    });

    it("restores a missing users row before creating memberships", async () => {
        db.tables.users = [];
        const res = await recoverOnboardingWorkspace(db.client, USER);
        expect(res).toEqual({ success: true, repaired: true });
        expect(db.tables.users).toMatchObject([{ id: USER.id, email: USER.email }]);
    });
});
