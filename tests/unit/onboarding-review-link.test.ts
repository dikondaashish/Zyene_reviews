import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { cleanReviewLink } from "@/components/onboarding/use-review-link-draft";

const source = (f: string) => readFileSync(f, "utf8");

describe("review link in onboarding", () => {
    it("keeps the link to lowercase letters, numbers and single dashes as it is typed", () => {
        expect(cleanReviewLink("Vindu Indian Restaurant")).toBe("vindu-indian-restaurant");
        expect(cleanReviewLink("Joe's  Pizza!!")).toBe("joes-pizza");
        expect(cleanReviewLink("a__b--c")).toBe("a-b-c");
        expect(cleanReviewLink("x".repeat(80))).toHaveLength(60);
    });

    it("checks availability across every business, not just the owner's own", () => {
        const check = source("src/services/businesses/slug-availability.ts");
        expect(check).toContain("createAdminClient()");
        expect(source("src/app/api/businesses/check-slug/route.ts")).toContain("isSlugTakenByAnotherBusiness(sanitized, exclude)");
        expect(source("src/services/businesses/business-patch-guards.ts")).toContain("isSlugTakenByAnotherBusiness(sanitized, businessId)");
    });

    it("is offered on the industry step and saved before the step moves on", () => {
        const step3 = source("src/components/onboarding/step3-form.tsx");
        expect(step3).toContain("<Step3ReviewLinkField");
        expect(step3.indexOf("await link.save()")).toBeLessThan(step3.indexOf("await onSubmit(data)"));
    });

    it("tells owners the link, logo, colours and wording are all changeable in Settings", () => {
        expect(source("src/components/onboarding/step3-review-link-field.tsx")).toContain("Settings → Public profile");
        expect(source("src/components/dashboard/welcome-tour/welcome-tour-slides.tsx")).toContain("Customise my page");
    });
});
