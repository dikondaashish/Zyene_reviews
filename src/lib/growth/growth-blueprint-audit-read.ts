import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { BLOG_SLUGS } from "@/lib/phase4/blog-data";
import { CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";
import { COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";
import { INDUSTRY_SLUGS } from "@/lib/phase3/industry-data";
import { FEATURE_PILLAR_SLUGS } from "@/lib/growth/feature-pillars";

export const APP_ROOT = path.join(process.cwd(), "src/app/(marketing)");

/** Read page.tsx plus page-view/page-client siblings (Phase 3 slim pages). */
export function readAppPageSource(pagePath: string): string {
    if (!existsSync(pagePath)) return "";
    let src = readFileSync(pagePath, "utf8");
    const dir = path.dirname(pagePath);
    for (const name of ["page-view.tsx", "page-client.tsx"]) {
        const sibling = path.join(dir, name);
        if (existsSync(sibling)) {
            src += `\n${readFileSync(sibling, "utf8")}`;
        }
    }
    try {
        for (const entry of readdirSync(dir)) {
            if (
                entry.endsWith("-section.tsx") ||
                entry.endsWith("-sections.tsx") ||
                entry.endsWith("-data.ts") ||
                entry.endsWith("-content.tsx")
            ) {
                src += `\n${readFileSync(path.join(dir, entry), "utf8")}`;
            }
        }
    } catch {
        /* ignore unreadable dirs */
    }
    return src;
}

export const REQUIRED_ROUTE_FILES: Record<string, string> = {
    "/help/[category]/[article]": "help/[category]/[article]/page.tsx",
};

/** Blueprint § Page Architecture — required live marketing URLs */
export const BLUEPRINT_REQUIRED_PATHS: string[] = [
    "/",
    "/about",
    "/contact",
    "/help",
    "/pricing",
    "/features",
    ...FEATURE_PILLAR_SLUGS.map((s) => `/features/${s}`),
    "/how-it-works",
    "/integrations",
    "/reset-password",
    "/industries",
    ...INDUSTRY_SLUGS.map((s) => `/industries/${s}`),
    "/compare",
    ...COMPETITOR_SLUGS.map((s) => `/compare/${s}`),
    "/case-studies",
    ...CASE_STUDY_SLUGS.map((s) => `/case-studies/${s}`),
    "/blog",
    ...BLOG_SLUGS.map((s) => `/blog/${s}`),
    "/resources",
    "/security",
    "/demo",
    "/enterprise",
    "/agencies",
    "/tools",
    "/partners",
    "/growth",
];

export const BLUEPRINT_FEATURE_PILLARS = [
    "review-monitoring",
    "ai-replies",
    "review-collection",
    "competitor-tracking",
    "local-seo",
    "analytics",
] as const;
