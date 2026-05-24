import {
    Zap,
    GitBranch,
    Sparkles,
    BarChart3,
    Building2,
    Scale,
    BookOpen,
    FileText,
    HelpCircle,
    ShieldCheck,
    Award,
    Handshake,
    Bot,
    Globe,
    TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const PUBLIC_STATUS_URL = "https://status.zyenereviews.com/";

export type MarketingNavLink = {
    href: string;
    label: string;
    icon: LucideIcon;
    desc: string;
};

export const PRODUCT_LINKS: MarketingNavLink[] = [
    { href: "/features", label: "Features Overview", icon: Sparkles, desc: "Everything Zyene can do for your business" },
    { href: "/features/review-monitoring", label: "Review Monitoring", icon: Sparkles, desc: "Unified inbox + real-time alerts" },
    { href: "/features/ai-replies", label: "AI-Powered Replies", icon: Bot, desc: "One-click drafts and auto-commenter" },
    { href: "/features/review-collection", label: "Review Collection", icon: ShieldCheck, desc: "Negative Feedback Shield included" },
    { href: "/features/competitor-tracking", label: "Competitor Tracking", icon: TrendingUp, desc: "Ratings, trends, and AI briefs" },
    { href: "/features/local-seo", label: "Local SEO Dashboard", icon: Globe, desc: "GBP keywords and performance" },
    { href: "/features/analytics", label: "Analytics & Reporting", icon: BarChart3, desc: "Trends, funnels, PDF and CSV exports" },
    { href: "/how-it-works", label: "How It Works", icon: GitBranch, desc: "4 steps to more 5-star reviews" },
    { href: "/integrations", label: "Integrations", icon: Zap, desc: "Google, Zapier, Square, and more" },
    { href: "/pricing", label: "Pricing", icon: BarChart3, desc: "Plans from $29.99/mo — no contracts" },
];

export const SOLUTIONS_LINKS: MarketingNavLink[] = [
    { href: "/industries", label: "By Industry", icon: Building2, desc: "Restaurants, dental, auto repair, and more" },
    { href: "/compare", label: "Compare Tools", icon: Scale, desc: "Zyene Reviews vs Birdeye, Podium, NiceJob, GatherUp" },
    { href: "/enterprise", label: "Enterprise", icon: Building2, desc: "Multi-location brands, SLA, SSO, white-label" },
    { href: "/agencies", label: "Agencies", icon: Handshake, desc: "White-label review management for agencies" },
];

export const RESOURCES_LINKS: MarketingNavLink[] = [
    { href: "/tools", label: "Free Tools", icon: Sparkles, desc: "Review link generator, reputation checker, response templates" },
    { href: "/blog", label: "Blog", icon: BookOpen, desc: "Practical guides on Google reviews and local SEO" },
    { href: "/resources", label: "Free Guides", icon: FileText, desc: "In-depth playbooks for local business owners" },
    { href: "/help", label: "Help Center", icon: HelpCircle, desc: "Setup guides, how-tos, and troubleshooting" },
    { href: "/case-studies", label: "Case Studies", icon: Award, desc: "Before/after results from local businesses" },
    { href: "/partners", label: "Partners", icon: Handshake, desc: "Agencies, POS integrations, and co-marketing" },
];

export const MARKETING_PREFETCH_HREFS = [
    "/docs",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/help",
    "/privacy",
    "/terms",
    "/data-retention",
    "/security",
    "/case-studies",
    "/partners",
    "/agencies",
    "/newsletter",
    "/pricing",
    "/features",
    "/how-it-works",
    "/integrations",
    "/industries",
    "/compare",
    "/blog",
    "/resources",
    "/help",
] as const;
