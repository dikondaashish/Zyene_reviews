import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { industryFromPlaceTypes } from "@/services/places/place-type-industry";
import { knownIndustry } from "@/components/onboarding/step3-form-categories";
import { showGoogleBadge } from "@/components/onboarding/step3-form";

vi.mock("@/app/actions/onboarding", () => ({ updateOnboardingStep: vi.fn(), updateBusinessAndLocation: vi.fn() }));

describe("industry from Google place types", () => {
    it("reads the business's primary type first", () => {
        expect(industryFromPlaceTypes("indian_restaurant", ["restaurant", "food"])).toBe("restaurant");
        expect(industryFromPlaceTypes("hair_salon")).toBe("salon");
        expect(industryFromPlaceTypes("dentist")).toBe("dental");
        expect(industryFromPlaceTypes("coffee_shop", ["cafe", "store"])).toBe("coffee");
        expect(industryFromPlaceTypes("car_repair")).toBe("automotive");
        expect(industryFromPlaceTypes("clothing_store")).toBe("retail");
    });

    it("falls back to the other types, and says nothing when no tile clearly fits", () => {
        expect(industryFromPlaceTypes("point_of_interest", ["establishment", "gym"])).toBe("gym");
        expect(industryFromPlaceTypes("lawyer", ["point_of_interest", "establishment"])).toBeNull();
        expect(industryFromPlaceTypes(undefined, [])).toBeNull();
    });
});

describe("Found on Google badge", () => {
    it("shows only when Google picked a real tile", () => {
        expect(showGoogleBadge("restaurant", true)).toBe(true);
        expect(showGoogleBadge("restaurant", false)).toBe(false); // typed in by hand
        expect(showGoogleBadge("other", true)).toBe(false); // Google's category matched no tile
        expect(showGoogleBadge("uncategorized", true)).toBe(false); // every new account starts here
        expect(showGoogleBadge(undefined, true)).toBe(false);
    });

    it("only pre-selects saved categories that are real tiles", () => {
        expect(knownIndustry("salon")).toBe("salon");
        expect(knownIndustry("uncategorized")).toBeNull();
        expect(knownIndustry("indian_restaurant")).toBeNull();
    });
});

describe("leaving step 2", () => {
    it("never marks typed-in or searched details as a Google connection, but keeps the detected industry", async () => {
        const { step2AfterSave } = await import("@/components/onboarding/step2-form-save-navigation");
        const onNext = vi.fn(async () => {});
        const update = vi.fn();
        await step2AfterSave(false, "restaurant", onNext, update)({ slug: null });
        expect(onNext).toHaveBeenCalledWith(false);
        expect(update).toHaveBeenCalledWith({ category: "restaurant", categoryFromGoogle: true });

        update.mockClear();
        await step2AfterSave(false, "", onNext, update)({ slug: null });
        await step2AfterSave(false, "other", onNext, update)({ slug: null });
        expect(update).not.toHaveBeenCalled();

        await step2AfterSave(true, undefined, onNext, update)({ slug: "vindu-indian-restaurant" });
        expect(onNext).toHaveBeenLastCalledWith(true);
        expect(update).toHaveBeenLastCalledWith({ slug: "vindu-indian-restaurant" });
    });

    it("only sets Google connected when step 2 says so", () => {
        const section = readFileSync("src/app/onboarding/onboarding-step-two-section.tsx", "utf8");
        expect(section).toContain("if (viaGoogle) setGoogleConnected(true);");
    });

    it("keeps the badge only if the owner kept Google's industry", () => {
        const glass = readFileSync("src/app/onboarding/onboarding-glass-steps-section.tsx", "utf8");
        expect(glass).toContain("categoryFromGoogle: Boolean(business.categoryFromGoogle) && category === business.category");
    });
});
