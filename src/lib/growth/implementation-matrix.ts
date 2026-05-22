// ─────────────────────────────────────────────────────────────────────────────
// Implementation Priority Matrix — GROWTH_BLUEPRINT § Implementation Priority
// Tracks phase deliverables and completion status for leadership reviews.
// ─────────────────────────────────────────────────────────────────────────────

export type MatrixTaskStatus = "complete" | "ongoing" | "external" | "deferred";

export interface MatrixTask {
    id: string;
    title: string;
    status: MatrixTaskStatus;
    deliverable?: string;
}

export interface MatrixWeekBlock {
    weekLabel: string;
    tasks: MatrixTask[];
}

export interface GrowthPhaseMatrix {
    phase: number;
    title: string;
    weekRange: string;
    headline: string;
    status: "complete" | "in_progress";
    blocks: MatrixWeekBlock[];
}

export const GROWTH_IMPLEMENTATION_MATRIX: GrowthPhaseMatrix[] = [
    {
        phase: 0,
        title: "Fix the Foundation",
        weekRange: "Week 1–2",
        headline: "Must Do First — Foundation",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 1",
                tasks: [
                    { id: "p0-help", title: "Fix dead help links", status: "complete", deliverable: "/help + 23 articles" },
                    { id: "p0-nav", title: "Add nav links (about, contact)", status: "complete", deliverable: "Marketing header/footer" },
                    { id: "p0-copy", title: "Fix copy conflicts", status: "complete", deliverable: "Homepage + pricing alignment" },
                    { id: "p0-domain", title: "Resolve domain / host routing", status: "complete", deliverable: "platform-routes.ts + middleware" },
                    { id: "p0-reset", title: "/reset-password", status: "complete", deliverable: "/reset-password" },
                ],
            },
            {
                weekLabel: "Week 2",
                tasks: [
                    { id: "p0-sitemap", title: "Create sitemap.ts", status: "complete", deliverable: "/sitemap.xml" },
                    { id: "p0-robots", title: "Create robots.ts", status: "complete", deliverable: "/robots.txt" },
                ],
            },
            {
                weekLabel: "Week 3–4",
                tasks: [
                    { id: "p0-meta", title: "Per-page metadata", status: "complete", deliverable: "generateMetadata on marketing routes" },
                    { id: "p0-jsonld", title: "JSON-LD structured data", status: "complete", deliverable: "Organization + product schema" },
                    { id: "p0-internal", title: "Internal linking", status: "complete", deliverable: "Nav, footer, hub pages" },
                    { id: "p0-kw", title: "Keyword research", status: "ongoing", deliverable: "docs/GROWTH_OPERATIONS.md" },
                    { id: "p0-gsc", title: "Search Console setup", status: "external", deliverable: "Google Search Console property" },
                ],
            },
        ],
    },
    {
        phase: 1,
        title: "SEO & Discoverability",
        weekRange: "Week 2–4",
        headline: "Foundation — discoverability",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 2",
                tasks: [
                    { id: "p1-og", title: "Add OG/Twitter meta", status: "complete", deliverable: "opengraph-image routes" },
                    { id: "p1-ogtpl", title: "OG image template", status: "complete", deliverable: "Dynamic OG for key pages" },
                    { id: "p1-global", title: "Global metadata fix", status: "complete", deliverable: "Root layout metadata" },
                ],
            },
        ],
    },
    {
        phase: 2,
        title: "Conversion Architecture",
        weekRange: "Week 4–6",
        headline: "Build Next — Conversion + core pages",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 4–5",
                tasks: [
                    { id: "p2-pricing", title: "/pricing page", status: "complete", deliverable: "/pricing" },
                    { id: "p2-features", title: "/features page", status: "complete", deliverable: "/features" },
                    { id: "p2-how", title: "/how-it-works", status: "complete", deliverable: "/how-it-works" },
                    { id: "p2-int", title: "/integrations", status: "complete", deliverable: "/integrations" },
                    { id: "p2-signup", title: "Signup flow improve", status: "complete", deliverable: "UTM capture + trial checkout" },
                ],
            },
        ],
    },
    {
        phase: 3,
        title: "Industry & Comparison Engine",
        weekRange: "Week 6–10",
        headline: "Build Next — SEO verticals",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 6–8",
                tasks: [
                    { id: "p3-ind-hub", title: "/industries hub", status: "complete", deliverable: "/industries" },
                    { id: "p3-ind-3", title: "Key verticals (restaurants, dental, auto)", status: "complete", deliverable: "8 industry pages" },
                    { id: "p3-nav", title: "Nav/footer redesign", status: "complete", deliverable: "Marketing layout" },
                ],
            },
            {
                weekLabel: "Week 8–10",
                tasks: [
                    { id: "p3-compare-hub", title: "/compare hub", status: "complete", deliverable: "/compare" },
                    { id: "p3-compare-b", title: "/compare/birdeye", status: "complete", deliverable: "4 competitor pages" },
                    { id: "p3-shots", title: "Product screenshots on pages", status: "complete", deliverable: "Industry + compare assets" },
                ],
            },
        ],
    },
    {
        phase: 4,
        title: "Content & Authority",
        weekRange: "Week 10–16",
        headline: "Scale — Content + trust articles",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 10–14",
                tasks: [
                    { id: "p4-blog-infra", title: "Blog infrastructure", status: "complete", deliverable: "/blog + blog-data.ts" },
                    { id: "p4-blog-4", title: "First blog posts", status: "complete", deliverable: `${"multiple"} posts live` },
                    { id: "p4-calendar", title: "Content calendar", status: "ongoing", deliverable: "Editorial in GROWTH_OPERATIONS.md" },
                ],
            },
            {
                weekLabel: "Week 14–16",
                tasks: [
                    { id: "p4-help", title: "Help center articles", status: "complete", deliverable: "23 help articles" },
                    { id: "p4-resources", title: "Resource guides", status: "complete", deliverable: "/resources/*" },
                    { id: "p4-cross", title: "Cross-linking audit", status: "complete", deliverable: "Hub ↔ article links" },
                ],
            },
        ],
    },
    {
        phase: 5,
        title: "Trust & Social Proof",
        weekRange: "Week 16–20",
        headline: "Scale — Trust flywheel",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 16–20",
                tasks: [
                    { id: "p5-cases", title: "Case studies (3–5)", status: "complete", deliverable: "/case-studies/*" },
                    { id: "p5-logos", title: "Customer logo bar", status: "complete", deliverable: "Homepage social proof" },
                    { id: "p5-security", title: "/security page", status: "complete", deliverable: "/security" },
                    { id: "p5-g2", title: "G2/Capterra listing", status: "external", deliverable: "Third-party profiles" },
                    { id: "p5-badge", title: "Review count badge", status: "ongoing", deliverable: "Live count when volume warrants" },
                ],
            },
        ],
    },
    {
        phase: 6,
        title: "Paid Acquisition & Partnerships",
        weekRange: "Week 20–28",
        headline: "Accelerate — Paid + partners",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 20–28",
                tasks: [
                    { id: "p6-ads", title: "Google Ads setup", status: "external", deliverable: "Google Ads account + UTMs" },
                    { id: "p6-meta", title: "Meta retargeting", status: "external", deliverable: "Meta pixel + audiences" },
                    { id: "p6-trial", title: "Trial email nurture", status: "complete", deliverable: "Inngest growth-functions" },
                    { id: "p6-news", title: "Newsletter setup", status: "complete", deliverable: "marketing_subscribers + cron" },
                    { id: "p6-partners", title: "Partnership outreach", status: "ongoing", deliverable: "/partners + UTM campaigns" },
                ],
            },
        ],
    },
    {
        phase: 7,
        title: "Product-Led Growth Loops",
        weekRange: "Week 28–36",
        headline: "Accelerate — PLG",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 28–36",
                tasks: [
                    { id: "p7-referral", title: "Referral program", status: "complete", deliverable: "referral_conversions + settings card" },
                    { id: "p7-tools", title: "Free tools (lead gen)", status: "complete", deliverable: "/tools/*" },
                    { id: "p7-powered", title: '"Powered by" optimize', status: "complete", deliverable: "PLG footers r/w/SMS/email" },
                    { id: "p7-upgrade", title: "Upgrade copy optimize", status: "complete", deliverable: "upgrade-modal-copy.ts" },
                    { id: "p7-viral", title: "Viral loop tracking", status: "complete", deliverable: "UTM + plg_ref on signup" },
                ],
            },
        ],
    },
    {
        phase: 8,
        title: "Scale & Enterprise",
        weekRange: "Week 36+",
        headline: "Accelerate — Enterprise",
        status: "complete",
        blocks: [
            {
                weekLabel: "Week 36+",
                tasks: [
                    { id: "p8-enterprise", title: "/enterprise page", status: "complete", deliverable: "/enterprise" },
                    { id: "p8-agencies", title: "/agencies page", status: "complete", deliverable: "/agencies + waitlist" },
                    { id: "p8-demo", title: "Demo + Cal.com", status: "complete", deliverable: "/demo" },
                    { id: "p8-deck", title: "Sales deck", status: "complete", deliverable: "docs/ENTERPRISE_SALES_DECK.md" },
                    { id: "p8-i18n", title: "International (ES industries)", status: "complete", deliverable: "/es/industries/*" },
                    { id: "p8-agency-dash", title: "Agency dashboard", status: "deferred", deliverable: "Waitlist → product roadmap" },
                    { id: "p8-kpi", title: "KPI dashboard + page map", status: "complete", deliverable: "/growth" },
                ],
            },
        ],
    },
];

export function summarizeImplementationMatrix(matrix: GrowthPhaseMatrix[]) {
    const tasks = matrix.flatMap((p) => p.blocks.flatMap((b) => b.tasks));
    return {
        phases: matrix.length,
        complete: tasks.filter((t) => t.status === "complete").length,
        ongoing: tasks.filter((t) => t.status === "ongoing").length,
        external: tasks.filter((t) => t.status === "external").length,
        deferred: tasks.filter((t) => t.status === "deferred").length,
        total: tasks.length,
    };
}
