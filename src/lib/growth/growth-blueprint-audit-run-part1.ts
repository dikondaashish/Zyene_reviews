import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { BLOG_SLUGS } from "@/lib/content/blog-data";
import { HELP_ARTICLE_MAP, HELP_CATEGORY_SLUGS, type HelpCategory } from "@/lib/content/help-data";
import { CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import { COMPETITOR_SLUGS } from "@/lib/comparisons/competitor-data";
import { INDUSTRY_SLUGS } from "@/lib/industries/industry-data";
import { GROWTH_IMPLEMENTATION_MATRIX } from "@/lib/growth/implementation-matrix";
import { buildGrowthPageInventory } from "@/lib/growth/page-inventory";
import type { BlueprintAuditItem } from "./growth-blueprint-audit-types";
import {
    APP_ROOT,
    BLUEPRINT_FEATURE_PILLARS,
    BLUEPRINT_REQUIRED_PATHS,
    REQUIRED_ROUTE_FILES,
    readAppPageSource,
} from "./growth-blueprint-audit-read";

export function appendGrowthBlueprintAuditPart1(
    items: BlueprintAuditItem[],
    inventory: ReturnType<typeof buildGrowthPageInventory>,
    inventoryPaths: Set<string>,
): void {
for (const p of BLUEPRINT_REQUIRED_PATHS) {
    const entry = inventory.find((e) => e.path === p);
    if (!entry) {
        items.push({
            id: `page-missing-${p}`,
            severity: "error",
            area: "pages",
            message: `Blueprint URL missing from page inventory: ${p}`,
        });
    } else if (entry.status !== "live" && entry.status !== "redirect" && p !== "/growth") {
        items.push({
            id: `page-not-live-${p}`,
            severity: "error",
            area: "pages",
            message: `Blueprint URL not live: ${p} (status: ${entry.status})`,
        });
    }
}

for (const [route, file] of Object.entries(REQUIRED_ROUTE_FILES)) {
    if (!existsSync(path.join(APP_ROOT, file))) {
        items.push({
            id: `route-file-${route}`,
            severity: "error",
            area: "pages",
            message: `Required route file missing for ${route}`,
            remediation: `src/app/(marketing)/${file}`,
        });
    }
}

for (const cat of HELP_CATEGORY_SLUGS) {
    const catPath = `/help/${cat}`;
    if (!inventoryPaths.has(catPath)) {
        items.push({
            id: `help-cat-inv-${cat}`,
            severity: "warning",
            area: "pages",
            message: `Help category hub not in page inventory: ${catPath}`,
        });
    }
}

const nestedArticleCount = Object.keys(HELP_ARTICLE_MAP).length;
if (!existsSync(path.join(APP_ROOT, "help/[slug]/[article]/page.tsx"))) {
    items.push({
        id: "help-nested-route",
        severity: "error",
        area: "pages",
        message: "Nested help articles /help/[slug]/[article] not implemented",
    });
} else if (nestedArticleCount < 20) {
    items.push({
        id: "help-article-count",
        severity: "warning",
        area: "content",
        message: `Expected 23 help articles; found ${nestedArticleCount}`,
    });
}

// The apex-domain branch of the proxy owns this redirect.
const customersRedirect = path.join(process.cwd(), "src/lib/routing/proxy-root-domain.ts");
if (existsSync(customersRedirect)) {
    const proxySrc = readFileSync(customersRedirect, "utf8");
    if (!proxySrc.includes("customersToCaseStudiesRedirect")) {
        items.push({
            id: "customers-redirect",
            severity: "error",
            area: "pages",
            message: "/customers → /case-studies redirect not found in proxy",
        });
    }
} else {
    items.push({
        id: "customers-redirect",
        severity: "error",
        area: "pages",
        message: "/customers redirect to /case-studies not found",
    });
}

if (CASE_STUDY_SLUGS.length < 3) {
    items.push({
        id: "case-study-count",
        severity: "warning",
        area: "content",
        message: `Blueprint targets 3–5 case studies; found ${CASE_STUDY_SLUGS.length}`,
    });
}

if (BLOG_SLUGS.length < 4) {
    items.push({
        id: "blog-count",
        severity: "warning",
        area: "content",
        message: `Blueprint targets 4+ launch blog posts; found ${BLOG_SLUGS.length}`,
    });
}

const matrixTasks = GROWTH_IMPLEMENTATION_MATRIX.flatMap((p) => p.blocks.flatMap((b) => b.tasks));
const featuresPagePath = path.join(APP_ROOT, "features/page.tsx");
if (existsSync(featuresPagePath)) {
    const featuresSrc = readAppPageSource(featuresPagePath);
    if (!featuresSrc.includes("product-foundation")) {
        items.push({
            id: "foundation-features-wire",
            severity: "warning",
            area: "foundation",
            message: "/features should import product-foundation positioning data",
        });
    }
    if (!featuresSrc.includes("PlatformPillarsSection")) {
        items.push({
            id: "foundation-pillars-7-10",
            severity: "error",
            area: "foundation",
            message: "/features missing PlatformPillarsSection for blueprint pillars 7–10",
        });
    }
}

const homeMetaPath = path.join(process.cwd(), "src/app/(marketing)/page.tsx");
if (existsSync(homeMetaPath)) {
    const homeSrc = readFileSync(homeMetaPath, "utf8");
    if (!homeSrc.includes("Negative Feedback Shield")) {
        items.push({
            id: "foundation-home-nfs",
            severity: "warning",
            area: "foundation",
            message: "Homepage metadata should mention Negative Feedback Shield (§1.2)",
        });
    }
}

const incompleteEngineering = matrixTasks.filter(
    (t) =>
        t.status !== "complete" &&
        t.status !== "external" &&
        t.status !== "ongoing" &&
        t.status !== "deferred"
);
for (const t of incompleteEngineering) {
    items.push({
        id: `matrix-${t.id}`,
        severity: "warning",
        area: "matrix",
        message: `Matrix task not complete: ${t.title} (${t.status})`,
        remediation: t.deliverable,
    });
}

const externalExpected = [
    "Google Ads setup",
    "Meta retargeting",
    "G2/Capterra listing",
    "Search Console setup",
];
for (const label of externalExpected) {
    const task = matrixTasks.find((t) => t.title.includes(label.split(" ")[0]!));
    if (task && task.status !== "external" && task.status !== "ongoing") {
        items.push({
            id: `external-${label}`,
            severity: "info",
            area: "matrix",
            message: `${label} is an operational task (run outside the codebase)`,
        });
    }
}

}
