import { afterEach, describe, expect, it, vi } from "vitest";
import { listGoogleBusinessLocations, mapLocationsForSelection } from "@/app/actions/onboarding/google-oauth-helpers";

afterEach(() => vi.unstubAllGlobals());

describe("onboarding Google location selection", () => {
    it("requests the resource ID needed to select a business", async () => {
        const fetchMock = vi.fn(async (url: string) => {
            if (url.includes("accountmanagement")) {
                return Response.json({ accounts: [{ name: "accounts/123" }] });
            }
            const fields = new URL(url).searchParams.get("readMask")?.split(",") ?? [];
            return Response.json({ locations: [{ title: "Example business",
                ...(fields.includes("name") ? { name: "locations/456" } : {}),
                storefrontAddress: { addressLines: ["123 Main St"], locality: "Kansas City" },
            }] });
        });
        vi.stubGlobal("fetch", fetchMock);
        const locations = mapLocationsForSelection(await listGoogleBusinessLocations("synthetic-token"));
        expect(locations[0]).toMatchObject({ name: "locations/456", businessName: "Example business", address: "123 Main St" });
    });
});
