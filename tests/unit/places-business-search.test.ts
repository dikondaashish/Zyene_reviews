import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { toBusinessPlaceMatch } from "@/services/places/places-business-search";

const comp = (longText: string, types: string[], shortText = longText) => ({ longText, shortText, types });

describe("onboarding business search", () => {
    it("turns a Google place into the form's street, city and two-letter state", () => {
        const match = toBusinessPlaceMatch({
            id: "abc",
            displayName: { text: "Mendon Pizza" },
            formattedAddress: "12 Main St, Mendon, MA 01756, USA",
            addressComponents: [
                comp("12", ["street_number"]),
                comp("Main Street", ["route"], "Main St"),
                comp("Mendon", ["locality", "political"]),
                comp("Massachusetts", ["administrative_area_level_1"], "MA"),
                comp("United States", ["country"], "US"),
            ],
            websiteUri: "https://mendonpizza.com/",
            nationalPhoneNumber: "(508) 555-0100",
        });
        expect(match).toEqual({
            placeId: "abc",
            name: "Mendon Pizza",
            formattedAddress: "12 Main St, Mendon, MA 01756, USA",
            street: "12 Main Street",
            city: "Mendon",
            state: "MA",
            country: "US",
            phone: "(508) 555-0100",
            website: "https://mendonpizza.com/",
            rating: null,
            reviewCount: 0,
            photoName: null,
            industry: null,
        });
    });

    it("keeps the province name and country outside the US, and falls back to the first address line", () => {
        const match = toBusinessPlaceMatch({
            id: "x",
            displayName: { text: "Cafe" },
            formattedAddress: "1 High St, London, UK",
            addressComponents: [comp("London", ["postal_town"]), comp("England", ["administrative_area_level_1"], "England"), comp("UK", ["country"], "GB")],
        });
        expect(match).toMatchObject({ street: "1 High St", city: "London", state: "England", country: "GB", website: null });
    });

    it("skips places without an id or name", () => {
        expect(toBusinessPlaceMatch({ displayName: { text: "No id" } })).toBeNull();
        expect(toBusinessPlaceMatch({ id: "y" })).toBeNull();
    });

    it("needs sign-in, validates the query and is rate limited", () => {
        const route = readFileSync(path.join(process.cwd(), "src/app/api/places/business-search/route.ts"), "utf8");
        expect(route).toContain("auth.getUser()");
        expect(route).toContain("z.string().trim().min(3).max(120)");
        expect(route).toContain("businessPlaceSearchRateLimit.limit(user.id)");
        expect(route).toContain('z.string().regex(/^[A-Z]{2}$/).catch("US")');
    });
});

describe("step 2 location rules", () => {
    it("needs a two-letter state in the US but not abroad", async () => {
        const { stepBusinessLocationSchema } = await import("@/lib/validations/onboarding");
        const base = { businessName: "Cafe", locationName: "Cafe", address: "1 High St", city: "London", phone: "" };
        expect(stepBusinessLocationSchema.safeParse({ ...base, state: "", country: "GB" }).success).toBe(true);
        expect(stepBusinessLocationSchema.safeParse({ ...base, state: "Ontario", country: "CA" }).success).toBe(true);
        expect(stepBusinessLocationSchema.safeParse({ ...base, state: "", country: "US" }).success).toBe(false);
        expect(stepBusinessLocationSchema.safeParse({ ...base, state: "MA" }).success).toBe(true);
        expect(stepBusinessLocationSchema.safeParse({ ...base, state: "MA", country: "usa" }).success).toBe(false);
    });
});
