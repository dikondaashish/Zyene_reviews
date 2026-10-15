import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Signed-in pages share one heading scale (src/app/product-typography.css).
 * These guards keep route-level size classes from creeping back onto h1/h2/h3.
 */
const ROOT = process.cwd();
const AUTHENTICATED_DIRS = [
    "src/app/(dashboard)",
    "src/app/onboarding",
    ...["analytics", "billing", "businesses", "campaigns", "customers", "dashboard", "errors",
        "google-seo-aeo", "integrations", "onboarding", "questions", "reviews", "settings"]
        .map((dir) => `src/components/${dir}`),
];
const SCALE_CLASS = { h1: "ui-page-title", h2: "ui-section-title", h3: "ui-card-title" } as const;
const SIZE_UTILITY = /(?:^|\s)(?:[a-z0-9]+:)*(?:text-(?:xs|sm|base|lg|xl|[2-9]xl|\[[^\]]+\])|font-(?:bold|semibold|medium|black|display)|tracking-|leading-)/;

function tsxFiles(dir: string): string[] {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
        const rel = path.join(dir, entry.name);
        if (entry.isDirectory()) return tsxFiles(rel);
        return entry.name.endsWith(".tsx") ? [rel] : [];
    });
}

const headings = AUTHENTICATED_DIRS.flatMap(tsxFiles).flatMap((file) => {
    const source = fs.readFileSync(path.join(ROOT, file), "utf8");
    return [...source.matchAll(/<(h[1-3])\b([^>]*)>/g)].map((match) => ({
        where: `${file}:${source.slice(0, match.index).split("\n").length}`,
        tag: match[1] as keyof typeof SCALE_CLASS,
        className: /className=(?:"([^"]*)"|\{cn\("([^"]*)")/.exec(match[2])?.slice(1).find(Boolean) ?? "",
    }));
});

describe("signed-in heading scale", () => {
    it("finds the authenticated headings", () => {
        expect(headings.filter((h) => h.tag === "h1").length).toBeGreaterThan(30);
    });

    it.each(["h1", "h2", "h3"] as const)("every %s uses its scale class and no size utilities", (tag) => {
        const offenders = headings
            .filter((h) => h.tag === tag)
            .filter((h) => !h.className.split(/\s+/).includes(SCALE_CLASS[tag]) || SIZE_UTILITY.test(h.className))
            .map((h) => `${h.where} <${tag} className="${h.className}">`);
        expect(offenders).toEqual([]);
    });

    it("defines fixed tokens with no breakpoint overrides", () => {
        const css = fs.readFileSync(path.join(ROOT, "src/app/product-typography.css"), "utf8");
        for (const role of ["page-title", "section-title", "card-title"]) {
            for (const suffix of ["", "-leading", "-weight", "-tracking"]) {
                expect(css).toMatch(new RegExp(`--type-${role}${suffix}:`));
            }
        }
        expect(css).not.toMatch(/@media/);
        expect(fs.readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8")).toContain('@import "./product-typography.css"');
    });
});
