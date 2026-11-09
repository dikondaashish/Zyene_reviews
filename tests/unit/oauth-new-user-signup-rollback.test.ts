import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("@/lib/auth/accept-business-invitation", () => ({
    acceptBusinessInvitationAdmin: vi.fn(async () => ({ accepted: false })),
}));
vi.mock("@/services/auth/oauth-new-user-messaging", () => ({ sendOAuthNewUserMessages: vi.fn(async () => {}) }));

import { runOAuthNewUserSignup } from "@/services/auth/oauth-callback-new-user";
import { recoverOnboardingWorkspace } from "@/services/auth/recover-onboarding-workspace";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const WORKSPACE_TABLES = ["organizations", "businesses", "business_members", "organization_members"];

/** Wraps the fake DB so writes to one table fail, the way a constraint or outage would. */
function failingWrites(db: FakeDb, table: string): SupabaseClient {
    const failure = { data: null, error: { code: "XX000", message: `${table} write failed` } };
    const failingQuery = {
        select: () => failingQuery,
        single: async () => failure,
        then: (resolve: (v: typeof failure) => unknown) => Promise.resolve(failure).then(resolve),
    };
    return {
        from: (t: string) => {
            const real = db.client.from(t);
            if (t !== table) return real;
            return new Proxy(real, {
                get(target, prop, receiver) {
                    if (prop === "insert" || prop === "upsert") return () => failingQuery;
                    return Reflect.get(target, prop, receiver);
                },
            });
        },
    } as unknown as SupabaseClient;
}

function run(admin: SupabaseClient) {
    const user = {
        id: USER_ID,
        email: "owner@example.com",
        user_metadata: { full_name: "Pat Owner" },
        app_metadata: { provider: "google" },
        identities: [],
    } as unknown as User;
    return runOAuthNewUserSignup({
        admin,
        request: new Request("https://auth.example.com/auth/callback?code=x"),
        data: { user },
        appUrl: "https://app.example.com",
        origin: "https://auth.example.com",
        inviteParamForAccept: "",
    });
}

describe("new-user signup leaves no half-created account", () => {
    let db: FakeDb;
    beforeEach(() => {
        db = createFakeDb({}, { users: [["id"]] });
    });

    it("creates user, organization, business and both owner memberships on success", async () => {
        const res = await run(db.client);
        expect(res.headers.get("location")).toBe("https://app.example.com/onboarding?new_signup=google");
        expect(db.tables.users).toHaveLength(1);
        expect(db.tables.organizations).toHaveLength(1);
        expect(db.tables.businesses).toHaveLength(1);
        expect(db.tables.business_members).toMatchObject([{ user_id: USER_ID, role: "owner" }]);
        expect(db.tables.organization_members).toMatchObject([
            { user_id: USER_ID, role: "ORG_OWNER", organization_id: db.tables.organizations[0].id },
        ]);
    });

    it.each(["organizations", "businesses", "business_members", "organization_members"])(
        "rolls the workspace back when the %s write fails but keeps the users row",
        async (table) => {
            const res = await run(failingWrites(db, table));
            expect(res.headers.get("location")).toBe("https://auth.example.com/login?error=setup_failed");
            for (const t of WORKSPACE_TABLES) expect(db.tables[t] ?? [], t).toHaveLength(0);
            // Memberships reference users(id), and an email user's next sign-in never re-runs
            // this callback, so onboarding repair needs this row to exist.
            expect(db.tables.users).toMatchObject([{ id: USER_ID, email: "owner@example.com" }]);
        },
    );

    it("onboarding repair completes setup after a failed signup", async () => {
        await run(failingWrites(db, "businesses"));
        const res = await recoverOnboardingWorkspace(db.client, {
            id: USER_ID,
            email: "owner@example.com",
            fullName: "Pat Owner",
        });
        expect(res).toEqual({ success: true, repaired: true });
        expect(db.tables.users).toHaveLength(1);
        expect(db.tables.organizations).toHaveLength(1);
        expect(db.tables.businesses).toHaveLength(1);
        expect(db.tables.business_members).toMatchObject([{ user_id: USER_ID, role: "owner" }]);
        expect(db.tables.organization_members).toMatchObject([{ user_id: USER_ID, role: "ORG_OWNER" }]);
    });
});
