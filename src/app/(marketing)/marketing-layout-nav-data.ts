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
    Award,
    Handshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FEATURE_PILLARS } from "@/lib/growth/feature-pillars";
import { FEATURE_NAV_ICONS } from "@/app/(marketing)/feature-nav-icons";

export const PUBLIC_STATUS_URL = "https://status.zyenereviews.com/";

export type MarketingNavLink = {
    href: string;
    label: string;
    icon: LucideIcon;
    desc: string;
};

export const PRODUCT_LINKS: MarketingNavLink[] = [
    { href: "/features", label: "Features Overview", icon: Sparkles, desc: "Everything Zyene can do for your business" },
    ...FEATURE_PILLARS.map((page) => ({
        href: `/features/${page.slug}`,
        label: page.navLabel,
        icon: FEATURE_NAV_ICONS[page.slug],
        desc: page.tagline,
    })),
    { href: "/how-it-works", label: "How It Works", icon: GitBranch, desc: "Four steps to a better review routine" },
    { href: "/integrations", label: "Integrations", icon: Zap, desc: "Google, Facebook, Yelp, API, and webhooks" },
    { href: "/pricing", label: "Pricing", icon: BarChart3, desc: "Plans from $29.99/mo - no contracts" },
];

export const SOLUTIONS_LINKS: MarketingNavLink[] = [
    { href: "/industries", label: "By Industry", icon: Building2, desc: "Restaurants, dental, auto repair, and more" },
    { href: "/compare", label: "Compare Tools", icon: Scale, desc: "Compare Zyene Reviews with leading review platforms" },
    { href: "/enterprise", label: "Enterprise", icon: Building2, desc: "Multi-location review workflows and white-label options" },
    { href: "/agencies", label: "Agencies", icon: Handshake, desc: "White-label review management for agencies" },
];

export const RESOURCES_LINKS: MarketingNavLink[] = [
    { href: "/tools", label: "Free Tools", icon: Sparkles, desc: "Review link generator, reputation checker, response templates" },
    { href: "/blog", label: "Blog", icon: BookOpen, desc: "Practical guides on Google reviews and local SEO" },
    { href: "/resources", label: "Free Guides", icon: FileText, desc: "In-depth playbooks for local business owners" },
    { href: "/help", label: "Help Center", icon: HelpCircle, desc: "Setup guides, how-tos, and troubleshooting" },
    { href: "/case-studies", label: "Case Studies", icon: Award, desc: "Example workflows for local businesses" },
    { href: "/partners", label: "Partners", icon: Handshake, desc: "Agencies, POS integrations, and co-marketing" },
];
