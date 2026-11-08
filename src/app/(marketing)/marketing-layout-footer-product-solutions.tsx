import Link from "next/link";
import { MarketingLayoutFooterLinkColumn } from "./marketing-layout-footer-link-column";

interface FooterLink {
    href: string;
    label: string;
}

const PRODUCT_LINKS: FooterLink[] = [
    { href: "/features", label: "Features" },
    { href: "/features/qr-code-reviews", label: "Review QR Codes" },
    { href: "/features/nfc-review-stands", label: "NFC Review Stands" },
    { href: "/features/ai-replies", label: "AI Review Replies" },
    { href: "/features/review-monitoring", label: "Review Monitoring" },
    { href: "/features/review-widgets", label: "Review Widgets" },
    { href: "/features/local-seo", label: "Local SEO" },
    { href: "/features/ai-visibility", label: "AI Visibility" },
    { href: "/features/competitor-tracking", label: "Competitor Tracking" },
    { href: "/features/multi-location", label: "Multi-Location" },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/integrations", label: "Integrations" },
    { href: "/docs", label: "Docs" },
    { href: "/docs/api", label: "API" },
];

const SOLUTION_LINKS: FooterLink[] = [
    { href: "/small-business", label: "Small Business" },
    { href: "/industries", label: "By Industry" },
    { href: "/industries/restaurants", label: "Restaurants" },
    { href: "/industries/dental", label: "Dental" },
    { href: "/industries/auto-repair", label: "Auto Repair" },
    { href: "/industries/salons", label: "Salons & Spas" },
    { href: "/industries/home-services", label: "Home Services" },
    { href: "/industries/hvac", label: "HVAC" },
    { href: "/industries/plumbing", label: "Plumbing" },
    { href: "/industries/electricians", label: "Electricians" },
    { href: "/industries/hotels", label: "Hotels" },
    { href: "/industries/medical", label: "Medical" },
    { href: "/industries/fitness", label: "Fitness & Gyms" },
    { href: "/compare", label: "Compare Tools" },
];

function FooterLinks({ links }: { links: FooterLink[] }) {
    return links.map((link) => (
        <li key={link.href}>
            <Link href={link.href} className="hover:text-primary transition-colors">
                {link.label}
            </Link>
        </li>
    ));
}

export function MarketingLayoutFooterProductColumn() {
    return (
        <MarketingLayoutFooterLinkColumn title="Product">
            <FooterLinks links={PRODUCT_LINKS} />
        </MarketingLayoutFooterLinkColumn>
    );
}

export function MarketingLayoutFooterSolutionsColumn() {
    return (
        <MarketingLayoutFooterLinkColumn title="Solutions">
            <FooterLinks links={SOLUTION_LINKS} />
        </MarketingLayoutFooterLinkColumn>
    );
}
