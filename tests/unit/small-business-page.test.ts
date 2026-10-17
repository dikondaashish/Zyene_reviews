import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(marketing)/small-business/page";
import SmallBusinessPage from "@/app/(marketing)/small-business/page-view";
import { VERIFIED_COMPETITOR_FACTS } from "@/lib/comparisons/verified-competitor-facts";
import { SMALL_BUSINESS_ANSWER, SMALL_BUSINESS_PRICE_ROWS } from "@/lib/marketing/small-business-content";
import { SMALL_BUSINESS_FAQS } from "@/lib/marketing/small-business-faqs";
import { getAllSitemapEntries } from "@/lib/seo/sitemap";
import { MARKETING_ROUTE_PREFIXES } from "@/lib/routing/platform-routes";
import { PLAN_MAP } from "@/services/stripe/plan-catalog";

const starterPrice = `$${PLAN_MAP.starter_monthly.price!.toFixed(2)}`;
const markup = renderToStaticMarkup(createElement(SmallBusinessPage));

function jsonLdBlocks(html: string): Array<Record<string, unknown>> {
    return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
        (match) => JSON.parse(match[1]) as Record<string, unknown>,
    );
}

describe("/small-business metadata", () => {
    it("targets the primary keyword with a canonical URL and social images", () => {
        expect(metadata.title).toBe("Review Management Software for Small Business");
        expect(String(metadata.title)).not.toContain("| Zyene Reviews");
        expect(String(metadata.alternates?.canonical)).toMatch(/\/small-business$/);
        expect(metadata.openGraph?.images).toBeTruthy();
        expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    });

    it("keeps the description within 160 characters and priced from the plan catalog", () => {
        const description = String(metadata.description);
        expect(description.length).toBeLessThanOrEqual(160);
        expect(description).toContain(starterPrice);
    });
});

describe("/small-business content", () => {
    it("opens with a 40–60 word answer priced from the plan catalog", () => {
        const words = SMALL_BUSINESS_ANSWER.trim().split(/\s+/).length;
        expect(words).toBeGreaterThanOrEqual(40);
        expect(words).toBeLessThanOrEqual(60);
        expect(SMALL_BUSINESS_ANSWER).toMatch(/^Zyene Reviews is review management software for small, single-location businesses/);
        expect(SMALL_BUSINESS_ANSWER).toContain(`from ${starterPrice}/mo`);
        expect(markup).toContain("<h1>Review management software for small business</h1>");
    });

    it("only quotes competitor prices from verified facts", () => {
        const competitorPrices = SMALL_BUSINESS_PRICE_ROWS.filter((row) => row.source).map((row) => row.price);
        const verified = Object.values(VERIFIED_COMPETITOR_FACTS).map((fact) => fact.price as string);
        for (const price of competitorPrices) expect(verified).toContain(price);
    });

    it("never describes Negative Feedback Shield as gating", () => {
        expect(markup).toContain("Go to Google");
        expect(markup.toLowerCase()).not.toMatch(/\bgated\b|\bgating\b|only happy customers/);
    });

    it("is in the sitemap and served on the marketing host", () => {
        const paths = getAllSitemapEntries().map((entry) => new URL(entry.url).pathname);
        expect(paths).toContain("/small-business");
        expect(MARKETING_ROUTE_PREFIXES).toContain("/small-business");
    });
});

describe("/small-business structured data", () => {
    const blocks = jsonLdBlocks(markup);

    it("publishes SoftwareApplication with priced offers", () => {
        const software = blocks.find((block) => block["@type"] === "SoftwareApplication");
        const offers = software?.offers as Array<{ "@type": string; price: string }>;
        expect(offers.length).toBeGreaterThan(0);
        expect(offers.every((offer) => offer["@type"] === "Offer")).toBe(true);
        expect(offers.map((offer) => offer.price)).toContain(PLAN_MAP.starter_monthly.price!.toFixed(2));
    });

    it("publishes a FAQPage matching the visible FAQ on cost, contracts, setup, platforms and Google policy", () => {
        const faq = blocks.find((block) => block["@type"] === "FAQPage");
        const questions = (faq?.mainEntity as Array<{ name: string }>).map((q) => q.name);
        expect(questions).toEqual(SMALL_BUSINESS_FAQS.map((item) => item.question));
        const joined = questions.join(" ").toLowerCase();
        for (const topic of ["cost", "contract", "setup", "platforms", "google"]) expect(joined).toContain(topic);
        for (const item of SMALL_BUSINESS_FAQS) expect(markup).toContain(item.question);
    });

    it("includes a breadcrumb back to the homepage", () => {
        expect(blocks.some((block) => block["@type"] === "BreadcrumbList")).toBe(true);
    });
});
