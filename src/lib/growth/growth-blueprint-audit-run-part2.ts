import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { BLOG_SLUGS } from "@/lib/content/blog-data";
import { HELP_CATEGORY_SLUGS, type HelpCategory } from "@/lib/content/help-data";
import { CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import type { BlueprintAuditItem } from "./growth-blueprint-audit-types";
import { APP_ROOT, readAppPageSource } from "./growth-blueprint-audit-read";

export function appendGrowthBlueprintAuditPart2(
    items: BlueprintAuditItem[],
    inventoryPaths: Set<string>,
): void {
    const homeMetaPath = path.join(process.cwd(), "src/app/(marketing)/page.tsx");

    // ── Phase 0 checks ──────────────────────────────────────────────────
    const resetPwPath = path.join(process.cwd(), "src/app/(auth)/reset-password/page.tsx");
if (!existsSync(resetPwPath)) {
    items.push({ id: "p0-reset-password", severity: "error", area: "phase0", message: "/reset-password route missing (§0.1)" });
}

const layoutPath = path.join(APP_ROOT, "layout.tsx");
if (existsSync(layoutPath)) {
    let layoutSrc = readFileSync(layoutPath, "utf8");
    try {
        for (const entry of readdirSync(APP_ROOT)) {
            if (entry.startsWith("marketing-layout-") && (entry.endsWith(".tsx") || entry.endsWith(".ts"))) {
                layoutSrc += `\n${readFileSync(path.join(APP_ROOT, entry), "utf8")}`;
            }
        }
    } catch {
        /* ignore */
    }
    if (!layoutSrc.includes('href="/about"')) {
        items.push({ id: "p0-nav-about", severity: "error", area: "phase0", message: "About not linked in marketing layout (§0.1)" });
    }
    if (!layoutSrc.includes('href="/contact"')) {
        items.push({ id: "p0-nav-contact", severity: "error", area: "phase0", message: "Contact not linked in marketing layout (§0.1)" });
    }
}

const rootLayoutPath = path.join(process.cwd(), "src/app/layout.tsx");
// metadataBase lives in layout-metadata.ts, re-exported from layout.tsx — check both.
const rootMetadataSrc = [rootLayoutPath, path.join(process.cwd(), "src/app/layout-metadata.ts")]
    .filter(existsSync)
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");
if (rootMetadataSrc && !rootMetadataSrc.includes("www.zyenereviews.com") && !rootMetadataSrc.includes("MARKETING_SITE_ORIGIN")) {
    items.push({ id: "p0-domain", severity: "error", area: "phase0", message: "metadataBase not set to canonical www marketing host (§0.3)" });
}

// ── Phase 1 checks ──────────────────────────────────────────────────
const homeSrc = existsSync(homeMetaPath) ? readAppPageSource(homeMetaPath) : "";
const rootSrc = existsSync(rootLayoutPath) ? readFileSync(rootLayoutPath, "utf8") : "";
if (!homeSrc.includes("OrganizationJsonLd") && !rootSrc.includes("OrganizationJsonLd")) {
    items.push({ id: "p1-org-jsonld", severity: "error", area: "phase1", message: "OrganizationJsonLd missing from homepage (§1.1)" });
}

if (existsSync(homeMetaPath)) {
    if (!homeSrc.includes("SoftwareApplicationJsonLd")) {
        items.push({ id: "p1-app-jsonld", severity: "error", area: "phase1", message: "SoftwareApplicationJsonLd missing from homepage (§1.1)" });
    }
    if (!homeSrc.includes("FAQPageJsonLd")) {
        items.push({ id: "p1-faq-jsonld", severity: "error", area: "phase1", message: "FAQPageJsonLd missing from homepage (§1.1)" });
    }
}

const pricingPath = path.join(APP_ROOT, "pricing/page.tsx");
const pricingSrc = existsSync(pricingPath) ? readAppPageSource(pricingPath) : "";
if (pricingSrc && !pricingSrc.includes("ProductJsonLd") && !pricingSrc.includes("PricingPlansJsonLd")) {
    items.push({ id: "p1-product-jsonld", severity: "error", area: "phase1", message: "Product/Pricing structured data missing from pricing page (§1.1)" });
}

// ── Phase 2 checks ──────────────────────────────────────────────────
const phase2Routes = ["pricing", "features", "how-it-works", "integrations"];
for (const route of phase2Routes) {
    if (!existsSync(path.join(APP_ROOT, `${route}/page.tsx`))) {
        items.push({ id: `p2-${route}`, severity: "error", area: "phase2", message: `/${route} page missing (§2)` });
    }
}

if (pricingSrc && !pricingSrc.includes("FAQPageJsonLd")) {
    items.push({ id: "p2-pricing-faq", severity: "error", area: "phase2", message: "Pricing page missing FAQPageJsonLd (§2.1)" });
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

const expectedHelpCategories = ["getting-started", "reviews", "campaigns", "analytics", "billing", "integrations"] as const;
for (const cat of expectedHelpCategories) {
    if (!HELP_CATEGORY_SLUGS.includes(cat as HelpCategory)) {
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

const emailSeqPath = path.join(process.cwd(), "src/lib/campaign-content/email-sequences-data.ts");
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

const upgradeModalCopyPath = path.join(process.cwd(), "src/lib/billing/upgrade-modal-copy.ts");
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

}
