import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const mocks = vi.hoisted(() => ({ repair: vi.fn() }));

// Run effects synchronously so the hook's loader can be exercised without a DOM.
vi.mock("react", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react")>()),
    useEffect: (fn: () => void) => { fn(); },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/app/actions/onboarding", () => ({ triggerOnboardingSync: vi.fn(async () => {}) }));
vi.mock("@/app/actions/onboarding/workspace-recovery", () => ({
    completeOnboardingWorkspaceSetup: mocks.repair,
}));

import { useOnboardingData } from "@/app/onboarding/use-onboarding-data";
import { WORKSPACE_MISSING_MESSAGE } from "@/app/onboarding/load-onboarding-workspace";

/** Called outside React on purpose: useEffect is mocked to run inline. */
const runOnboardingDataHook = useOnboardingData;
const USER_ID = "33333333-3333-4333-8333-333333333333";

function withAuth(db: FakeDb): SupabaseClient {
    return {
        from: db.client.from,
        auth: { getUser: async () => ({ data: { user: { id: USER_ID, email: "a@b.co" } }, error: null }) },
    } as unknown as SupabaseClient;
}

async function load(db: FakeDb) {
    const state = {
        loadError: null as string | null,
        organization: null as unknown,
        business: null as unknown,
        stepResolved: false,
    };
    runOnboardingDataHook({
        supabase: withAuth(db),
        setUser: vi.fn(),
        setOrganization: (o) => { state.organization = o; },
        setBusiness: (b) => { state.business = b; },
        setGoogleConnected: vi.fn(),
        setLoadError: (e) => { state.loadError = e; },
        setCurrentStep: vi.fn(),
        setIsStepResolved: (r) => { state.stepResolved = r; },
        isStepResolved: false,
        user: null,
    });
    await vi.waitFor(() => expect(state.loadError !== null || state.stepResolved).toBe(true));
    return state;
}

describe("onboarding with a half-created account", () => {
    let db: FakeDb;
    beforeEach(() => {
        mocks.repair.mockReset();
        db = createFakeDb({ users: [{ id: USER_ID, onboarding_step: 0, phone: null }] });
    });

    it("completes setup and loads the new workspace instead of spinning", async () => {
        mocks.repair.mockImplementation(async () => {
            db.tables.organizations = [{ id: "org-1", name: "A's Org" }];
            db.tables.organization_members = [{ organization_id: "org-1", user_id: USER_ID }];
            db.tables.businesses = [{ id: "biz-1", name: "A's Business", organization_id: "org-1", city: null }];
            return { success: true, repaired: true };
        });
        const state = await load(db);
        expect(mocks.repair).toHaveBeenCalledTimes(1);
        expect(state.loadError).toBeNull();
        expect(state.organization).toMatchObject({ id: "org-1" });
        expect(state.business).toMatchObject({ id: "biz-1" });
        expect(state.stepResolved).toBe(true);
    });

    it("shows the repair error when setup cannot be completed", async () => {
        mocks.repair.mockResolvedValue({ success: false, error: "We couldn't finish setting up your account." });
        const state = await load(db);
        expect(state.loadError).toBe("We couldn't finish setting up your account.");
        expect(state.stepResolved).toBe(false);
    });

    it("shows an error, not a spinner, when the business is still missing after repair", async () => {
        db.tables.organizations = [{ id: "org-1", name: "A's Org" }];
        db.tables.organization_members = [{ organization_id: "org-1", user_id: USER_ID }];
        mocks.repair.mockResolvedValue({ success: true, repaired: false });
        const state = await load(db);
        expect(state.loadError).toBe(WORKSPACE_MISSING_MESSAGE);
    });

    it("does not call repair for a complete account", async () => {
        db.tables.organizations = [{ id: "org-1", name: "A's Org" }];
        db.tables.organization_members = [{ organization_id: "org-1", user_id: USER_ID }];
        db.tables.businesses = [{ id: "biz-1", name: "Biz", organization_id: "org-1", city: "X" }];
        const state = await load(db);
        expect(mocks.repair).not.toHaveBeenCalled();
        expect(state.business).toMatchObject({ id: "biz-1" });
    });
});
