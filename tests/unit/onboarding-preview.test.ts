import { describe, expect, it } from "vitest";
import { buildOnboardingPreview, buildSetupChecklist } from "@/components/onboarding/onboarding-preview-model";
import { onboardingGuideMessage } from "@/components/onboarding/onboarding-guide-copy";

const business = { id: "b1", name: "Karthik's Business", city: null, category: null };

describe("onboarding business preview", () => {
    it("hides the sign-up placeholder name until a real business is known", () => {
        expect(buildOnboardingPreview(business, {}).name).toBeNull();
        const picked = buildOnboardingPreview(business, {
            name: "Vindu Indian Restaurant", city: "Providence", state: "RI", average_rating: 4.7, total_reviews: 334, category: "restaurant",
        });
        expect(picked).toMatchObject({ name: "Vindu Indian Restaurant", place: "Providence, RI", rating: 4.7, reviews: 334, category: "Restaurant" });
    });

    it("treats a missing or zero rating as no rating", () => {
        expect(buildOnboardingPreview({ ...business, average_rating: 0 }, {}).rating).toBeNull();
    });

    it("ticks the setup list off in the order the owner meets each part", () => {
        const preview = buildOnboardingPreview(business, { name: "Vindu", category: "restaurant" });
        const states = (step: number, google = false) => buildSetupChecklist(step, preview, google).map((i) => i.state);
        expect(states(1)).toEqual(["current", "todo", "todo", "todo", "todo", "todo"]);
        expect(states(2)).toEqual(["done", "current", "todo", "todo", "todo", "todo"]);
        expect(states(4, true)).toEqual(["done", "done", "done", "done", "current", "todo"]);
    });
});

describe("onboarding assistant", () => {
    it("speaks to the owner by name and about their business", () => {
        expect(onboardingGuideMessage(1, "Karthik", null)).toContain("Hi Karthik!");
        expect(onboardingGuideMessage(2, "Karthik", null)).toContain("Start typing its name");
        expect(onboardingGuideMessage(2, "Karthik", "Vindu")).toContain("Found Vindu");
        expect(onboardingGuideMessage(4, "Karthik", "Vindu")).toContain("Vindu");
    });
});

describe("sample cover", () => {
    it("matches the industry, with a storefront until the industry is known", async () => {
        const { sampleCoverFor } = await import("@/components/onboarding/onboarding-preview-model");
        const { existsSync } = await import("node:fs");
        expect(sampleCoverFor("salon")).toBe("/onboarding/covers/salon.jpg");
        expect(sampleCoverFor(null)).toBe("/onboarding/covers/other.jpg");
        expect(sampleCoverFor("uncategorized")).toBe("/onboarding/covers/other.jpg");
        for (const c of ["restaurant", "coffee", "salon", "dental", "gym", "spa", "hotel", "retail", "automotive", "healthcare", "other"]) {
            expect(existsSync(`public/onboarding/covers/${c}.jpg`)).toBe(true);
        }
    });
});

describe("assistant copy without a business name", () => {
    it("never starts a sentence in lower case", () => {
        for (const step of [1, 2, 3, 4, 5, 6, 7]) {
            expect(onboardingGuideMessage(step, "Karthik", null)).toMatch(/^[A-Z]/);
        }
    });
});

describe("onboarding chrome", () => {
    it("keeps help and sign-out in the top bar, not floating over the form", async () => {
        const { readFileSync } = await import("node:fs");
        const layout = readFileSync("src/app/onboarding/layout.tsx", "utf8");
        expect(layout).toContain("<OnboardingAccountMenu email=");
        expect(readFileSync("src/components/onboarding/onboarding-help-button.tsx", "utf8")).not.toContain("fixed bottom-4");
    });

    it("gives every welcome slide a photo that exists", async () => {
        const { existsSync } = await import("node:fs");
        for (const f of ["review-link", "past-customers", "replies", "team"]) {
            expect(existsSync(`public/onboarding/welcome/${f}.jpg`)).toBe(true);
        }
    });
});
