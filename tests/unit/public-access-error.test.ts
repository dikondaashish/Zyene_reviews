import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccessError } from "@/components/public/access-error";

describe("public review recovery", () => {
    it.each([
        ["subscription", "https://app.zyenereviews.com/settings/billing", "Upgrade to activate"],
        ["platform", "https://app.zyenereviews.com/onboarding", "Connect Google Profile"],
    ] as const)("keeps the correct owner recovery action for %s", (type, href, label) => {
        const html = renderToStaticMarkup(createElement(AccessError, { type, businessName: "Subzero" }));

        expect(html).toContain(`href="${href}"`);
        expect(html).toContain(label);
        expect(html.match(/<h1\b/g)).toHaveLength(1);
        expect(html).toContain("Sign in to your business account to continue.");
    });

    it("keeps customer notification separate from an owner billing action", () => {
        const html = renderToStaticMarkup(createElement(AccessError, { type: "subscription", businessName: "A & B <Shop>" }));

        expect(html).toContain("A &amp; B &lt;Shop&gt;");
        expect(html).toContain("Here to leave a review?");
        expect(html).toContain("Copy it, then send it to the business yourself.");
        expect(html.indexOf("Copy a message for the owner")).toBeLessThan(html.indexOf("Play catch the stars"));
    });
});
