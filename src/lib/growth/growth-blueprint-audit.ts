// ─────────────────────────────────────────────────────────────────────────────
// Automated audit — GROWTH_BLUEPRINT §§ 0–8, 14–16 + page architecture table
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { BLOG_SLUGS } from "@/lib/phase4/blog-data";
import { HELP_ARTICLE_MAP, HELP_CATEGORY_SLUGS } from "@/lib/phase4/help-data";
import { CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";
import { COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";
import { INDUSTRY_SLUGS } from "@/lib/phase3/industry-data";
import { KPI_DEFINITIONS } from "@/lib/growth/kpi-definitions";
import { GROWTH_IMPLEMENTATION_MATRIX } from "@/lib/growth/implementation-matrix";
import { buildGrowthPageInventory } from "@/lib/growth/page-inventory";
import { PRODUCT_PILLARS, POSITIONING } from "@/lib/growth/product-foundation";
import { FEATURE_PILLAR_SLUGS } from "@/lib/growth/feature-pillars";

export type AuditSeverity = "error" | "warning" | "info";

export interface BlueprintAuditItem {
    id: string;
    severity: AuditSeverity;
    area: "foundation" | "market" | "architecture" | "kpi" | "pages" | "matrix" | "content" | "phase0" | "phase1" | "phase2" | "phase3";
    message: string;
    remediation?: string;
}

const APP_ROOT = path.join(process.cwd(), "src/app/(marketing)");

const REQUIRED_ROUTE_FILES: Record<string, string> = {
    "/customers": "customers/page.tsx",
    "/help/[category]/[article]": "help/[category]/[article]/page.tsx",
};

/** Blueprint § Page Architecture — required live marketing URLs */
const BLUEPRINT_REQUIRED_PATHS: string[] = [
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

const BLUEPRINT_FEATURE_PILLARS = [
    "review-monitoring",
    "ai-replies",
    "review-collection",
    "competitor-tracking",
    "local-seo",
    "analytics",
] as const;

export function runGrowthBlueprintAudit(): BlueprintAuditItem[] {
    const items: BlueprintAuditItem[] = [];
    const inventory = buildGrowthPageInventory();
    const inventoryPaths = new Set(inventory.map((p) => p.path));

    if (PRODUCT_PILLARS.length !== 10) {
        items.push({
            id: "foundation-pillars",
            severity: "error",
            area: "foundation",
            message: `Expected 10 product pillars in product-foundation.ts, found ${PRODUCT_PILLARS.length}`,
        });
    }

    if (!POSITIONING.oneLiner.includes("Birdeye")) {
        items.push({
            id: "foundation-positioning",
            severity: "warning",
            area: "foundation",
            message: "Positioning one-liner may be out of sync with blueprint §2.3",
        });
    }

    for (const slug of BLUEPRINT_FEATURE_PILLARS) {
        const pillarPath = `/features/${slug}`;
        if (!existsSync(path.join(APP_ROOT, "features/[pillar]/page.tsx"))) {
            items.push({
                id: `feature-route-missing`,
                severity: "error",
                area: "architecture",
                message: "Feature pillar dynamic route missing",
            });
            break;
        }
        if (!inventoryPaths.has(pillarPath)) {
            items.push({
                id: `feature-inv-${slug}`,
                severity: "error",
                area: "architecture",
                message: `Feature pillar not in page inventory: ${pillarPath}`,
            });
        }
    }

    if (!existsSync(path.join(process.cwd(), "src/app/sitemap.ts"))) {
        items.push({ id: "sitemap", severity: "error", area: "architecture", message: "sitemap.ts missing" });
    }
    if (!existsSync(path.join(process.cwd(), "src/app/robots.ts"))) {
        items.push({ id: "robots", severity: "error", area: "architecture", message: "robots.ts missing" });
    }

    for (const slug of COMPETITOR_SLUGS) {
        if (!inventoryPaths.has(`/compare/${slug}`)) {
            items.push({
                id: `compare-${slug}`,
                severity: "error",
                area: "market",
                message: `Comparison page missing: /compare/${slug}`,
            });
        }
    }

    if (KPI_DEFINITIONS.length !== 15) {
        items.push({
            id: "kpi-count",
            severity: "error",
            area: "kpi",
            message: `Expected 15 KPI definitions, found ${KPI_DEFINITIONS.length}`,
        });
    }

    const needsSessions = KPI_DEFINITIONS.find((k) => k.id === "visitor_signup_rate");
    if (needsSessions?.computable && !process.env.GROWTH_MARKETING_SESSIONS_30D) {
        items.push({
            id: "kpi-sessions-env",
            severity: "info",
            area: "kpi",
            message: "Visitor → signup rate needs GROWTH_MARKETING_SESSIONS_30D or Vercel/GA sessions",
            remediation: "Set GROWTH_MARKETING_SESSIONS_30D in env for automatic % on /growth",
        });
    }

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
    if (!existsSync(path.join(APP_ROOT, "help/[category]/[article]/page.tsx"))) {
        items.push({
            id: "help-nested-route",
            severity: "error",
            area: "pages",
            message: "Nested help articles /help/[category]/[article] not implemented",
        });
    } else if (nestedArticleCount < 20) {
        items.push({
            id: "help-article-count",
            severity: "warning",
            area: "content",
            message: `Expected 23 help articles; found ${nestedArticleCount}`,
        });
    }

    const customersRedirect = path.join(APP_ROOT, "customers/page.tsx");
    if (!existsSync(customersRedirect)) {
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
        const featuresSrc = readFileSync(featuresPagePath, "utf8");
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

    // ── Phase 0 checks ──────────────────────────────────────────────────
    const resetPwPath = path.join(process.cwd(), "src/app/(auth)/reset-password/page.tsx");
    if (!existsSync(resetPwPath)) {
        items.push({ id: "p0-reset-password", severity: "error", area: "phase0", message: "/reset-password route missing (§0.1)" });
    }

    const layoutPath = path.join(APP_ROOT, "layout.tsx");
    if (existsSync(layoutPath)) {
        const layoutSrc = readFileSync(layoutPath, "utf8");
        if (!layoutSrc.includes('href="/about"')) {
            items.push({ id: "p0-nav-about", severity: "error", area: "phase0", message: "About not linked in marketing layout (§0.1)" });
        }
        if (!layoutSrc.includes('href="/contact"')) {
            items.push({ id: "p0-nav-contact", severity: "error", area: "phase0", message: "Contact not linked in marketing layout (§0.1)" });
        }
    }

    const rootLayoutPath = path.join(process.cwd(), "src/app/layout.tsx");
    if (existsSync(rootLayoutPath)) {
        const rootSrc = readFileSync(rootLayoutPath, "utf8");
        if (!rootSrc.includes("zyenereviews.com")) {
            items.push({ id: "p0-domain", severity: "error", area: "phase0", message: "metadataBase not set to zyenereviews.com (§0.3)" });
        }
    }

    // ── Phase 1 checks ──────────────────────────────────────────────────
    if (existsSync(rootLayoutPath)) {
        const rootSrc = readFileSync(rootLayoutPath, "utf8");
        if (!rootSrc.includes("OrganizationJsonLd")) {
            items.push({ id: "p1-org-jsonld", severity: "error", area: "phase1", message: "OrganizationJsonLd missing from root layout (§1.1)" });
        }
    }

    if (existsSync(homeMetaPath)) {
        const homeSrc = readFileSync(homeMetaPath, "utf8");
        if (!homeSrc.includes("SoftwareApplicationJsonLd")) {
            items.push({ id: "p1-app-jsonld", severity: "error", area: "phase1", message: "SoftwareApplicationJsonLd missing from homepage (§1.1)" });
        }
        if (!homeSrc.includes("FAQPageJsonLd")) {
            items.push({ id: "p1-faq-jsonld", severity: "error", area: "phase1", message: "FAQPageJsonLd missing from homepage (§1.1)" });
        }
    }

    const pricingPath = path.join(APP_ROOT, "pricing/page.tsx");
    if (existsSync(pricingPath)) {
        const pricingSrc = readFileSync(pricingPath, "utf8");
        if (!pricingSrc.includes("ProductJsonLd")) {
            items.push({ id: "p1-product-jsonld", severity: "error", area: "phase1", message: "ProductJsonLd missing from pricing page (§1.1)" });
        }
    }

    // ── Phase 2 checks ──────────────────────────────────────────────────
    const phase2Routes = ["pricing", "features", "how-it-works", "integrations"];
    for (const route of phase2Routes) {
        if (!existsSync(path.join(APP_ROOT, `${route}/page.tsx`))) {
            items.push({ id: `p2-${route}`, severity: "error", area: "phase2", message: `/${route} page missing (§2)` });
        }
    }

    if (existsSync(pricingPath)) {
        const pricingSrc = readFileSync(pricingPath, "utf8");
        if (!pricingSrc.includes("FAQPageJsonLd")) {
            items.push({ id: "p2-pricing-faq", severity: "error", area: "phase2", message: "Pricing page missing FAQPageJsonLd (§2.1)" });
        }
    }

    // ── Phase 3 checks ──────────────────────────────────────────────────
    const expectedIndustries = ["restaurants", "dental", "auto-repair", "salons", "home-services", "medical", "hotels", "fitness"];
    for (const ind of expectedIndustries) {
        if (!inventoryPaths.has(`/industries/${ind}`)) {
            items.push({ id: `p3-ind-${ind}`, severity: "error", area: "phase3", message: `Industry page /industries/${ind} not in inventory (§3.1)` });
        }
    }

    const expectedCompetitors = ["birdeye", "podium", "nicejob", "gatherup"];
    for (const comp of expectedCompetitors) {
        if (!inventoryPaths.has(`/compare/${comp}`)) {
            items.push({ id: `p3-comp-${comp}`, severity: "error", area: "phase3", message: `Comparison page /compare/${comp} not in inventory (§3.2)` });
        }
    }

    // ── Phase 4 checks ──────────────────────────────────────────────────
    const phase4Routes = ["blog", "resources"];
    for (const route of phase4Routes) {
        if (!existsSync(path.join(APP_ROOT, `${route}/page.tsx`))) {
            items.push({ id: `p4-${route}`, severity: "error", area: "content", message: `/${route} page missing (§4)` });
        }
    }

    if (BLOG_SLUGS.length < 4) {
        items.push({ id: "p4-blog-count", severity: "error", area: "content", message: `Blueprint needs 4+ blog posts; found ${BLOG_SLUGS.length} (§4.1)` });
    }

    const expectedGuides = ["google-reviews-guide", "negative-review-templates", "local-seo-checklist", "review-request-templates"];
    for (const guide of expectedGuides) {
        if (!inventoryPaths.has(`/resources/${guide}`)) {
            items.push({ id: `p4-guide-${guide}`, severity: "error", area: "content", message: `Resource guide /resources/${guide} not in inventory (§4.2)` });
        }
    }

    const expectedHelpCategories = ["getting-started", "reviews", "campaigns", "analytics", "billing", "integrations"];
    for (const cat of expectedHelpCategories) {
        if (!HELP_CATEGORY_SLUGS.includes(cat)) {
            items.push({ id: `p4-help-cat-${cat}`, severity: "error", area: "content", message: `Help category "${cat}" missing (§4.3)` });
        }
    }

    // ── Phase 5 checks ──────────────────────────────────────────────────
    if (CASE_STUDY_SLUGS.length < 3) {
        items.push({ id: "p5-case-studies", severity: "error", area: "content", message: `Blueprint needs 3-5 case studies; found ${CASE_STUDY_SLUGS.length} (§5.1)` });
    }

    if (!existsSync(path.join(APP_ROOT, "security/page.tsx"))) {
        items.push({ id: "p5-security", severity: "error", area: "pages", message: "/security page missing (§5.4)" });
    }

    if (!existsSync(path.join(APP_ROOT, "case-studies/page.tsx"))) {
        items.push({ id: "p5-case-studies-page", severity: "error", area: "pages", message: "/case-studies page missing (§5.1)" });
    }

    // ── Phase 6 checks ──────────────────────────────────────────────────
    if (!existsSync(path.join(APP_ROOT, "partners/page.tsx"))) {
        items.push({ id: "p6-partners", severity: "error", area: "pages", message: "/partners page missing (§6.3)" });
    }

    const newsletterApiPath = path.join(process.cwd(), "src/app/api/marketing/newsletter/subscribe/route.ts");
    if (!existsSync(newsletterApiPath)) {
        items.push({ id: "p6-newsletter-api", severity: "error", area: "architecture", message: "Newsletter subscribe API missing (§6.4)" });
    }

    const emailSeqPath = path.join(process.cwd(), "src/lib/phase6/email-sequences-data.ts");
    if (!existsSync(emailSeqPath)) {
        items.push({ id: "p6-email-sequences", severity: "error", area: "content", message: "Trial nurture email sequences missing (§6.4)" });
    }

    // ── Phase 7 checks ──────────────────────────────────────────────────
    const phase7ToolRoutes = ["tools", "tools/review-link-generator", "tools/reputation-score-checker", "tools/review-response-generator"];
    for (const route of phase7ToolRoutes) {
        if (!existsSync(path.join(APP_ROOT, `${route}/page.tsx`))) {
            items.push({ id: `p7-${route}`, severity: "error", area: "pages", message: `/${route} page missing (§7.3)` });
        }
    }

    const plgAttrPath = path.join(process.cwd(), "src/lib/growth/plg-attribution.ts");
    if (!existsSync(plgAttrPath)) {
        items.push({ id: "p7-plg-attribution", severity: "error", area: "architecture", message: "PLG attribution tracking missing (§7.1)" });
    }

    const referralPath = path.join(process.cwd(), "src/lib/growth/referral.ts");
    if (!existsSync(referralPath)) {
        items.push({ id: "p7-referral", severity: "error", area: "architecture", message: "Referral program module missing (§7.2)" });
    }

    const upgradeModalCopyPath = path.join(process.cwd(), "src/lib/phase7/upgrade-modal-copy.ts");
    if (!existsSync(upgradeModalCopyPath)) {
        items.push({ id: "p7-upgrade-copy", severity: "error", area: "content", message: "Upgrade modal copy data missing (§7.4)" });
    }

    // ── Phase 8 checks ──────────────────────────────────────────────────
    const phase8Routes = ["demo", "enterprise", "agencies"];
    for (const route of phase8Routes) {
        if (!existsSync(path.join(APP_ROOT, `${route}/page.tsx`))) {
            items.push({ id: `p8-${route}`, severity: "error", area: "pages", message: `/${route} page missing (§8)` });
        }
    }

    const esIndustriesPath = path.join(APP_ROOT, "es/industries/page.tsx");
    if (!existsSync(esIndustriesPath)) {
        items.push({ id: "p8-es-industries", severity: "error", area: "pages", message: "Spanish industry pages missing (§8.3)" });
    }

    const salesDeckPath = path.join(process.cwd(), "docs/ENTERPRISE_SALES_DECK.md");
    if (!existsSync(salesDeckPath)) {
        items.push({ id: "p8-sales-deck", severity: "warning", area: "content", message: "Enterprise sales deck not found (§8.1)" });
    }

    if (items.filter((i) => i.severity === "error").length === 0 && items.length === 0) {
        items.push({
            id: "all-clear",
            severity: "info",
            area: "pages",
            message: "All automated blueprint checks passed. External ops (ads, GSC, G2, NPS) still run manually.",
        });
    }

    return items;
}

export function summarizeBlueprintAudit(items: BlueprintAuditItem[]) {
    return {
        errors: items.filter((i) => i.severity === "error").length,
        warnings: items.filter((i) => i.severity === "warning").length,
        info: items.filter((i) => i.severity === "info").length,
        passed: items.filter((i) => i.severity === "error").length === 0,
    };
}
