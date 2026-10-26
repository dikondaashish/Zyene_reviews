import { NextResponse, type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticateApiKey = vi.fn();

vi.mock("@/app/api/v1/_lib/auth", () => ({
    authenticateApiKey: (...args: unknown[]) => authenticateApiKey(...args),
    corsPreflight: () => new NextResponse(null, { status: 204 }),
    withCors: (response: NextResponse) => response,
}));

const { GET } = await import("@/app/api/v1/me/route");

const request = () => new Request("https://app.example.com/api/v1/me") as unknown as NextRequest;

describe("GET /api/v1/me", () => {
    beforeEach(() => authenticateApiKey.mockReset());

    it("returns the business the API key belongs to", async () => {
        authenticateApiKey.mockResolvedValue({
            ok: true,
            businessId: "biz-1",
            businessName: "Vindu Indian Restaurant",
            businessSlug: "vindu-indian-restaurant",
        });

        const res = await GET(request());

        expect(authenticateApiKey).toHaveBeenCalledWith(expect.anything(), "review_requests:write");
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
            success: true,
            data: {
                businessId: "biz-1",
                businessName: "Vindu Indian Restaurant",
                businessSlug: "vindu-indian-restaurant",
            },
        });
    });

    it("passes through the auth failure response", async () => {
        authenticateApiKey.mockResolvedValue({
            ok: false,
            response: NextResponse.json({ success: false, error: "Missing or invalid API key." }, { status: 401 }),
        });

        const res = await GET(request());

        expect(res.status).toBe(401);
    });
});
