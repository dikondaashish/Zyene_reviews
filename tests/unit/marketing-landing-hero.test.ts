import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LandingHero } from "@/components/marketing/landing-hero";

describe("LandingHero interior variants", () => {
    it("renders an intentional compact hero without fallback media", () => {
        const html = renderToStaticMarkup(createElement(LandingHero, {
            eyebrow: "Resources",
            title: "Practical guidance",
            description: "Find the answer you need.",
            variant: "directory",
            media: { kind: "none" },
        }));

        expect(html).toContain("landing-hero--directory");
        expect(html).toContain('data-hero-media="none"');
        expect(html).not.toContain("interior-scene");
        expect(html).not.toContain("landing-hero-image");
    });

    it("labels a product demonstration and gives it the product grid", () => {
        const html = renderToStaticMarkup(createElement(LandingHero, {
            eyebrow: "AI replies",
            title: "A reply that sounds like you",
            description: "Try the fictional example.",
            variant: "product",
            media: {
                kind: "product",
                node: createElement("button", { type: "button" }, "Generate sample"),
                label: "Interactive sample reply",
            },
        }));

        expect(html).toContain("landing-hero--product");
        expect(html).toContain('aria-label="Interactive sample reply"');
        expect(html).toContain("Generate sample");
    });

    it("keeps the legacy image prop working during migration", () => {
        const html = renderToStaticMarkup(createElement(LandingHero, {
            eyebrow: "Industry",
            title: "Made for local business",
            description: "A focused workflow.",
            image: { src: "/marketing/about/team-collaboration.webp", alt: "Illustrative team" },
        }));

        expect(html).toContain("landing-hero--story");
        expect(html).toContain("Illustrative team");
    });
});
