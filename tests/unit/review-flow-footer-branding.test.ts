import { describe, expect, it } from "vitest";
import { resolveReviewFlowFooterBranding } from "@/lib/brand/review-flow-footer-branding";

describe("review-flow footer branding", () => {
    it("keeps a resolved Zyene footer URL stable for client rendering", () => {
        const href = "https://www.zyenereviews.com/?utm_source=plg&utm_medium=review-page";

        expect(resolveReviewFlowFooterBranding({
            footerLink: href,
            footerCompanyName: "Zyene Reviews",
            footerLogoUrl: "/zyene-reviews-logo.svg",
        })).toMatchObject({ href, label: "Zyene Reviews" });
    });
});
