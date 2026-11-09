import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ upsert: vi.fn(), patch: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) } }),
}));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: async () => true }));
vi.mock("@/services/customers/customer-identity-store", () => ({ upsertCustomerByIdentity: mocks.upsert }));
vi.mock("@/services/customers/patch-customer-record", () => ({ patchCustomerRecord: mocks.patch }));

import { createCustomer, patchCustomer } from "@/services/customers/customers-api";

const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";
const CUSTOMER_ID = "33333333-3333-4333-8333-333333333333";

function req(method: string, body: unknown) {
    return new NextRequest("https://app.example.com/api/customers", {
        method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
    });
}

describe("customers API with one-word names", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.upsert.mockResolvedValue({ id: CUSTOMER_ID });
        mocks.patch.mockResolvedValue({ id: CUSTOMER_ID, first_name: "John", last_name: null });
    });

    it("creates a customer when lastName is null", async () => {
        const res = await createCustomer(req("POST", {
            businessId: BUSINESS_ID, firstName: "Ann", lastName: null, email: "ann@example.com", tags: [],
        }));
        expect(res.ok).toBe(true);
        expect(mocks.upsert).toHaveBeenCalledWith(expect.anything(),
            expect.objectContaining({ firstName: "Ann", lastName: undefined }));
    });

    it("renaming to one word clears the last name instead of failing", async () => {
        const res = await patchCustomer(req("PATCH", {
            id: CUSTOMER_ID, businessId: BUSINESS_ID, first_name: "John", last_name: null,
        }));
        expect(res.status).toBe(200);
        expect(mocks.patch).toHaveBeenCalledWith(expect.anything(),
            expect.objectContaining({ first_name: "John", last_name: null }));
    });
});
