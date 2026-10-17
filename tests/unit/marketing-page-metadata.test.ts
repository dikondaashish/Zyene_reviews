import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FreeToolJsonLd } from "@/components/seo/json-ld";
import { fitMarketingTitle, mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { metadata as pricingMetadata } from "@/app/(marketing)/pricing/page";
import { metadata as featuresMetadata } from "@/app/(marketing)/features/page";
import { metadata as aboutMetadata } from "@/app/(marketing)/about/page";

const SUFFIX = " | Zyene Reviews";

function rendered(title: unknown): string {
    if (typeof title === "string") return `${title}${SUFFIX}`;
    if (title && typeof title === "object" && "absolute" in title) return String(title.absolute);
    return "";
}

describe("fitMarketingTitle", () => {
    it("keeps the brand template when the full title fits in 60 characters", () => {
        expect(fitMarketingTitle("Review Management Features & AI Replies")).toBe(
            "Review Management Features & AI Replies"
        );
    });

    it("drops the template suffix when it would push the title past 60 characters", () => {
        const long = "Google Business Profile Optimization Checklist 2026";
        expect(fitMarketingTitle(long)).toEqual({ absolute: long });
    });

    it("leaves non-string titles untouched", () => {
        expect(fitMarketingTitle({ absolute: "X" })).toEqual({ absolute: "X" });
        expect(fitMarketingTitle(undefined)).toBeUndefined();
    });
});

describe("mergeMarketingSocial", () => {
    it("re-applies og:site_name, locale, and twitter:site that page metadata would otherwise drop", () => {
        const meta = mergeMarketingSocial({ title: "T", openGraph: { title: "T" }, twitter: { title: "T" } });
        expect(meta.openGraph).toMatchObject({ siteName: "Zyene Reviews", locale: "en_US" });
        expect(meta.twitter).toMatchObject({ site: "@zyenereviews" });
    });
});

describe("FreeToolJsonLd", () => {
    it("emits a free WebApplication plus breadcrumb for /tools pages", () => {
        const html = renderToStaticMarkup(
            createElement(FreeToolJsonLd, { name: "Free Tool", description: "D", path: "/tools/free-tool" })
        );
        const json = JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
        const types = json["@graph"].map((node: { "@type": string }) => node["@type"]);
        expect(types).toEqual(["WebApplication", "BreadcrumbList"]);
        expect(json["@graph"][0]).toMatchObject({ isAccessibleForFree: true, offers: { price: "0" } });
    });
});

describe("core marketing page titles", () => {
    it.each([
        ["pricing", pricingMetadata],
        ["features", featuresMetadata],
        ["about", aboutMetadata],
    ])("%s carries a keyword and renders within 60 characters", (_route, meta) => {
        const title = rendered(meta.title);
        expect(title.length).toBeLessThanOrEqual(60);
        expect(title.toLowerCase()).toContain("review management");
    });
});
