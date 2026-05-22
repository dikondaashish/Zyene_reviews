// ─────────────────────────────────────────────────────────────────────────────
// Page Architecture Map — GROWTH_BLUEPRINT § Page Architecture
// Single source of truth for marketing + product URLs and sitemap coverage.
// ─────────────────────────────────────────────────────────────────────────────

import { BLOG_SLUGS } from "@/lib/phase4/blog-data";
import { HELP_CATEGORY_SLUGS, HELP_SLUGS, helpArticleNestedPath, HELP_ARTICLE_MAP } from "@/lib/phase4/help-data";
import { RESOURCE_SLUGS } from "@/lib/phase4/resource-data";
import { CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";
import { COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";
import { INDUSTRY_SLUGS } from "@/lib/phase3/industry-data";
import { FREE_TOOLS } from "@/lib/phase7/free-tools-data";
import { FEATURE_PILLAR_SLUGS } from "@/lib/growth/feature-pillars";
import { LOCALIZED_INDUSTRY_PAGES } from "@/lib/phase8/localized-industries";

export type PageStatus = "live" | "planned" | "redirect" | "app-only";
export type PagePriority = "P0" | "P1" | "P2" | "—";
export type PageType =
    | "conversion"
    | "seo"
    | "trust"
    | "legal"
    | "auth"
    | "app"
    | "plg"
    | "enterprise"
    | "tool"
    | "docs"
    | "content"
    | "ops";

export interface GrowthPageEntry {
    path: string;
    label: string;
    status: PageStatus;
    phase: number;
    priority: PagePriority;
    pageType: PageType;
    inSitemap: boolean;
    indexed: boolean;
    notes?: string;
}

function entry(
    partial: Omit<GrowthPageEntry, "status" | "inSitemap" | "indexed"> &
        Partial<Pick<GrowthPageEntry, "status" | "inSitemap" | "indexed">>
): GrowthPageEntry {
    return {
        status: "live",
        inSitemap: true,
        indexed: true,
        ...partial,
    };
}

const DOC_PATHS = [
    "/docs",
    "/docs/quickstart",
    "/docs/install",
    "/docs/how-it-works",
    "/docs/graph",
    "/docs/content-types",
    "/docs/sync",
    "/docs/api",
    "/docs/cookbook",
    "/docs/plugins",
    "/docs/changelog",
] as const;

/** All public and product routes from the growth blueprint, with implementation status. */
export function buildGrowthPageInventory(): GrowthPageEntry[] {
    const pages: GrowthPageEntry[] = [
        // ── Existing (Phase 0–2) ──
        entry({ path: "/", label: "Homepage", phase: 2, priority: "P0", pageType: "conversion", notes: "Long-scroll; refined Phase 2" }),
        entry({ path: "/about", label: "About", phase: 0, priority: "P1", pageType: "trust" }),
        entry({ path: "/contact", label: "Contact", phase: 0, priority: "P1", pageType: "trust" }),
        entry({ path: "/help", label: "Help hub", phase: 4, priority: "P1", pageType: "content" }),
        entry({ path: "/privacy", label: "Privacy", phase: 0, priority: "—", pageType: "legal", inSitemap: true }),
        entry({ path: "/terms", label: "Terms", phase: 0, priority: "—", pageType: "legal" }),
        entry({ path: "/data-retention", label: "Data retention", phase: 0, priority: "—", pageType: "legal" }),
        entry({ path: "/login", label: "Login", phase: 0, priority: "—", pageType: "auth", inSitemap: false, indexed: false }),
        entry({ path: "/signup", label: "Signup", phase: 2, priority: "P0", pageType: "auth", inSitemap: false, indexed: false }),
        entry({ path: "/forgot-password", label: "Forgot password", phase: 0, priority: "—", pageType: "auth", inSitemap: false, indexed: false }),
        entry({ path: "/reset-password", label: "Reset password", phase: 0, priority: "P0", pageType: "auth", inSitemap: false, indexed: false }),
        entry({ path: "/onboarding", label: "Onboarding", phase: 2, priority: "P0", pageType: "app", inSitemap: false, indexed: false }),

        // ── Phase 2 conversion ──
        entry({ path: "/pricing", label: "Pricing", phase: 2, priority: "P0", pageType: "conversion" }),
        entry({ path: "/features", label: "Features", phase: 2, priority: "P0", pageType: "conversion" }),
        ...FEATURE_PILLAR_SLUGS.map((slug) =>
            entry({
                path: `/features/${slug}`,
                label: `Feature: ${slug}`,
                phase: 2,
                priority: "P1",
                pageType: "conversion",
            })
        ),
        entry({ path: "/how-it-works", label: "How it works", phase: 2, priority: "P1", pageType: "conversion" }),
        entry({ path: "/integrations", label: "Integrations", phase: 2, priority: "P1", pageType: "conversion" }),

        // ── Phase 3 SEO ──
        entry({ path: "/industries", label: "Industries hub", phase: 3, priority: "P0", pageType: "seo" }),
        ...INDUSTRY_SLUGS.map((slug) =>
            entry({
                path: `/industries/${slug}`,
                label: `Industry: ${slug}`,
                phase: 3,
                priority: ["restaurants", "dental"].includes(slug) ? "P0" : "P1",
                pageType: "seo",
            })
        ),
        entry({ path: "/compare", label: "Compare hub", phase: 3, priority: "P0", pageType: "seo" }),
        ...COMPETITOR_SLUGS.map((slug) =>
            entry({
                path: `/compare/${slug}`,
                label: `Compare: ${slug}`,
                phase: 3,
                priority: slug === "birdeye" ? "P0" : "P1",
                pageType: "seo",
            })
        ),

        // ── Phase 4 content ──
        entry({ path: "/blog", label: "Blog index", phase: 4, priority: "P1", pageType: "content" }),
        ...BLOG_SLUGS.map((slug) =>
            entry({ path: `/blog/${slug}`, label: `Blog: ${slug}`, phase: 4, priority: "P1", pageType: "content" })
        ),
        entry({ path: "/resources", label: "Resources hub", phase: 4, priority: "P2", pageType: "content" }),
        ...RESOURCE_SLUGS.map((slug) =>
            entry({ path: `/resources/${slug}`, label: `Resource: ${slug}`, phase: 4, priority: "P2", pageType: "content" })
        ),
        ...HELP_CATEGORY_SLUGS.map((cat) =>
            entry({
                path: `/help/${cat}`,
                label: `Help category: ${cat}`,
                phase: 4,
                priority: "P1",
                pageType: "content",
            })
        ),
        ...HELP_SLUGS.map((slug) =>
            entry({
                path: `/help/${slug}`,
                label: `Help: ${slug}`,
                phase: 4,
                priority: "P1",
                pageType: "content",
                notes: "Flat URL; canonical nested path in metadata",
            })
        ),
        ...Object.values(HELP_ARTICLE_MAP).map((article) =>
            entry({
                path: helpArticleNestedPath(article),
                label: `Help (nested): ${article.title}`,
                phase: 4,
                priority: "P1",
                pageType: "content",
            })
        ),

        // ── Phase 5 trust ──
        entry({ path: "/security", label: "Security", phase: 5, priority: "P1", pageType: "trust" }),
        entry({
            path: "/case-studies",
            label: "Case studies hub",
            phase: 5,
            priority: "P1",
            pageType: "trust",
            notes: "Blueprint listed /customers; shipped as /case-studies",
        }),
        ...CASE_STUDY_SLUGS.map((slug) =>
            entry({
                path: `/case-studies/${slug}`,
                label: `Case study: ${slug}`,
                phase: 5,
                priority: "P1",
                pageType: "trust",
            })
        ),
        entry({
            path: "/customers",
            label: "Legacy /customers → case studies",
            phase: 5,
            priority: "—",
            pageType: "trust",
            status: "redirect",
            inSitemap: false,
            indexed: false,
            notes: "301 to /case-studies",
        }),
        ...CASE_STUDY_SLUGS.map((slug) =>
            entry({
                path: `/customers/${slug}`,
                label: `Legacy /customers/${slug}`,
                phase: 5,
                priority: "—",
                pageType: "trust",
                status: "redirect",
                inSitemap: false,
                indexed: false,
                notes: "301 to /case-studies/{slug}",
            })
        ),

        // ── Phase 6 partnerships ──
        entry({ path: "/partners", label: "Partners", phase: 6, priority: "P1", pageType: "conversion" }),
        entry({ path: "/newsletter/unsubscribe", label: "Newsletter unsubscribe", phase: 6, priority: "—", pageType: "ops", inSitemap: false, indexed: false }),

        // ── Phase 7 PLG ──
        entry({ path: "/tools", label: "Free tools hub", phase: 7, priority: "P1", pageType: "tool" }),
        ...FREE_TOOLS.map((t) =>
            entry({ path: `/tools/${t.slug}`, label: t.title, phase: 7, priority: "P1", pageType: "tool" })
        ),
        entry({
            path: "/r/[slug]",
            label: "Review capture flow",
            phase: 7,
            priority: "P0",
            pageType: "plg",
            inSitemap: false,
            indexed: false,
            notes: "Powered-by footer + PLG UTM on signup",
        }),
        entry({
            path: "/w/[slug]",
            label: "Embeddable widget",
            phase: 7,
            priority: "P0",
            pageType: "plg",
            inSitemap: false,
            indexed: false,
            notes: "Widget PLG footer; track views in Vercel Analytics",
        }),

        // ── Phase 8 enterprise + i18n ──
        entry({ path: "/demo", label: "Book a demo", phase: 8, priority: "P2", pageType: "enterprise" }),
        entry({ path: "/enterprise", label: "Enterprise", phase: 8, priority: "P2", pageType: "enterprise" }),
        entry({ path: "/agencies", label: "Agencies", phase: 8, priority: "P2", pageType: "enterprise" }),
        entry({ path: "/es/industries", label: "ES industries hub", phase: 8, priority: "P2", pageType: "seo" }),
        ...LOCALIZED_INDUSTRY_PAGES.map((p) =>
            entry({
                path: `/es/industries/${p.localizedSlug}`,
                label: `ES: ${p.name}`,
                phase: 8,
                priority: "P2",
                pageType: "seo",
            })
        ),

        // ── Docs ──
        ...DOC_PATHS.map((path) =>
            entry({
                path,
                label: path.replace("/docs/", "").replace("/docs", "Docs index") || "Docs",
                phase: 4,
                priority: "P1",
                pageType: "docs",
            })
        ),

        // ── Growth ops (internal) ──
        entry({
            path: "/growth",
            label: "Growth KPI dashboard",
            phase: 8,
            priority: "—",
            pageType: "ops",
            inSitemap: false,
            indexed: false,
            notes: "Password-protected; robots disallow",
        }),
    ];

    return pages.sort((a, b) => a.path.localeCompare(b.path));
}

export function summarizePageInventory(pages: GrowthPageEntry[]) {
    const live = pages.filter((p) => p.status === "live").length;
    const inSitemap = pages.filter((p) => p.inSitemap).length;
    const byPhase = pages.reduce<Record<number, number>>((acc, p) => {
        acc[p.phase] = (acc[p.phase] ?? 0) + 1;
        return acc;
    }, {});
    return { total: pages.length, live, inSitemap, byPhase };
}
