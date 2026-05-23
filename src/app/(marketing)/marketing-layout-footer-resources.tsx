import Link from "next/link";
import { MarketingLayoutFooterLinkColumn } from "./marketing-layout-footer-link-column";

export function MarketingLayoutFooterResourcesColumn() {
    return (
        <MarketingLayoutFooterLinkColumn title="Resources">
            <li>
                <Link href="/tools" className="hover:text-primary transition-colors">
                    Free Tools
                </Link>
            </li>
            <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                    Blog
                </Link>
            </li>
            <li>
                <Link href="/resources" className="hover:text-primary transition-colors">
                    Free Guides
                </Link>
            </li>
            <li>
                <Link
                    href="/resources/google-reviews-guide"
                    className="hover:text-primary transition-colors"
                >
                    Google Reviews Guide
                </Link>
            </li>
            <li>
                <Link
                    href="/resources/negative-review-templates"
                    className="hover:text-primary transition-colors"
                >
                    Response Templates
                </Link>
            </li>
            <li>
                <Link
                    href="/resources/local-seo-checklist"
                    className="hover:text-primary transition-colors"
                >
                    Local SEO Checklist
                </Link>
            </li>
            <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                    Help Center
                </Link>
            </li>
            <li>
                <Link href="/case-studies" className="hover:text-primary transition-colors">
                    Case Studies
                </Link>
            </li>
            <li>
                <Link href="/partners" className="hover:text-primary transition-colors">
                    Partners
                </Link>
            </li>
            <li>
                <Link href="/agencies" className="hover:text-primary transition-colors">
                    Agencies
                </Link>
            </li>
            <li>
                <Link href="/es/industries" className="hover:text-primary transition-colors">
                    Industrias (ES)
                </Link>
            </li>
        </MarketingLayoutFooterLinkColumn>
    );
}
