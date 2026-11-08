/**
 * Product pages each help category should link to. Help articles are the only
 * deep pages that reference these features in context, so the links pass
 * crawl priority to feature, docs and pricing pages that otherwise sit one
 * click from nothing but the footer.
 */
import type { HelpCategory } from "./help-types";

export interface HelpRelatedLink {
    label: string;
    href: string;
}

export const HELP_RELATED_LINKS: Record<HelpCategory, HelpRelatedLink[]> = {
    "getting-started": [
        { label: "How Zyene Reviews works", href: "/how-it-works" },
        { label: "Review collection features", href: "/features/review-collection" },
        { label: "Review request campaigns", href: "/features/review-requests" },
        { label: "Plans and pricing", href: "/pricing" },
    ],
    "reviews": [
        { label: "AI review replies", href: "/features/ai-replies" },
        { label: "Automatic review replies", href: "/features/automatic-review-replies" },
        { label: "Review monitoring and alerts", href: "/features/review-monitoring" },
        { label: "Free review response generator", href: "/tools/review-response-generator" },
    ],
    "campaigns": [
        { label: "Review request campaigns", href: "/features/review-campaigns" },
        { label: "SMS and email review requests", href: "/features/review-requests" },
        { label: "Review request templates", href: "/resources/review-request-templates" },
        { label: "Customer CRM", href: "/features/customer-crm" },
    ],
    "analytics": [
        { label: "Review analytics", href: "/features/analytics" },
        { label: "Smart insights", href: "/features/smart-insights" },
        { label: "Competitor tracking", href: "/features/competitor-tracking" },
        { label: "Local SEO tools", href: "/features/local-seo" },
    ],
    "billing": [
        { label: "Compare plans", href: "/pricing" },
        { label: "Multi-location review management", href: "/features/multi-location" },
        { label: "Enterprise plans", href: "/enterprise" },
        { label: "Agency partner program", href: "/agencies" },
    ],
    "integrations": [
        { label: "API quickstart", href: "/docs/quickstart" },
        { label: "REST API reference", href: "/docs/api" },
        { label: "Review widgets", href: "/features/review-widgets" },
        { label: "All integrations", href: "/integrations" },
    ],
};
