import type { ContentPillar } from "@/lib/content/blog-data";

export const BLOG_PILLARS: Array<{ id: ContentPillar | "all"; label: string }> = [
    { id: "all", label: "All Posts" },
    { id: "google-reviews", label: "Google Reviews" },
    { id: "responding-to-reviews", label: "Responding to Reviews" },
    { id: "local-seo", label: "Local SEO" },
    { id: "reputation-management", label: "Reputation Management" },
    { id: "industry-specific", label: "Industry Specific" },
    { id: "competitor-analysis", label: "Competitor Analysis" },
];
