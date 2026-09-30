import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => {
    const values = new Map<string, string>();
    return {
        values,
        get: vi.fn((name: string) => {
            const value = values.get(name);
            return value === undefined ? undefined : { value };
        }),
        set: vi.fn((name: string, value: string, options: { maxAge: number }) => {
            if (options.maxAge === 0) values.delete(name);
            else values.set(name, value);
        }),
    };
});

vi.mock("next/headers", () => ({ cookies: async () => store }));

import { ADD_BUSINESS_OAUTH_COOKIE } from "@/services/auth/add-business-oauth-state";
import {
    beginAddBusinessOAuth,
    consumeAddBusinessOAuth,
} from "@/services/auth/add-business-oauth-cookie";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const ORG_ID = "33333333-3333-4333-8333-333333333333";

describe("add-business OAuth cookie", () => {
    beforeEach(() => {
        store.values.clear();
        vi.clearAllMocks();
        process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-cookie-secret";
    });

    it("consumes a bound state only once", async () => {
        const nonce = await beginAddBusinessOAuth(USER_ID, ORG_ID);

        expect(await consumeAddBusinessOAuth(nonce, USER_ID)).toMatchObject({
            userId: USER_ID,
            organizationId: ORG_ID,
        });
        expect(await consumeAddBusinessOAuth(nonce, USER_ID)).toBeNull();
        expect(store.set).toHaveBeenCalledWith(
            ADD_BUSINESS_OAUTH_COOKIE,
            expect.any(String),
            expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
        );
    });

    it("rejects a different browser session and clears the state", async () => {
        const nonce = await beginAddBusinessOAuth(USER_ID, ORG_ID);

        expect(await consumeAddBusinessOAuth(
            nonce, "22222222-2222-4222-8222-222222222222",
        )).toBeNull();
        expect(store.values.has(ADD_BUSINESS_OAUTH_COOKIE)).toBe(false);
    });
});
