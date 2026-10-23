import { describe, expect, it } from "vitest";
import { stepCategorySchema } from "@/lib/validations/onboarding";

describe("onboarding business type step: support email", () => {
    it("accepts a valid email and trims it", () => {
        const parsed = stepCategorySchema.parse({ category: "restaurant", supportEmail: "  hello@vindu.com " });
        expect(parsed.supportEmail).toBe("hello@vindu.com");
    });

    it("lets the owner leave it blank", () => {
        expect(stepCategorySchema.safeParse({ category: "restaurant", supportEmail: "" }).success).toBe(true);
        expect(stepCategorySchema.safeParse({ category: "restaurant" }).success).toBe(true);
        const spaces = stepCategorySchema.safeParse({ category: "restaurant", supportEmail: "   " });
        expect(spaces.success && spaces.data.supportEmail).toBe("");
    });

    it("rejects something that isn't an email, with a plain message", () => {
        const result = stepCategorySchema.safeParse({ category: "restaurant", supportEmail: "vindu restaurant" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Enter a valid email address");
    });
});
