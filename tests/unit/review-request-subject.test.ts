import { describe, expect, it } from "vitest";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";

describe("reviewRequestSubject", () => {
    it("leads with the customer's first name", () => {
        expect(reviewRequestSubject("Willow Hair Studio", false, "Linda Smith")).toBe("Linda, thanks for stopping by Willow Hair Studio");
        expect(reviewRequestSubject("Willow Hair Studio", true, "José")).toBe("José, following up on your visit to Willow Hair Studio");
    });

    it("falls back to the plain subject without a usable name", () => {
        for (const name of [undefined, null, "", "there", "evil.example/x", "12345", "<b>Al</b>"]) {
            expect(reviewRequestSubject("Willow Hair Studio", false, name)).toBe("Thanks for stopping by Willow Hair Studio");
        }
    });
});
