import Link from "next/link";
import { MarketingLayoutFooterLinkColumn } from "./marketing-layout-footer-link-column";

export function MarketingLayoutFooterProductColumn() {
    return (
        <MarketingLayoutFooterLinkColumn title="Product">
            <li>
                <Link href="/features" className="hover:text-primary transition-colors">
                    Features
                </Link>
            </li>
            <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                </Link>
            </li>
            <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors">
                    How It Works
                </Link>
            </li>
            <li>
                <Link href="/integrations" className="hover:text-primary transition-colors">
                    Integrations
                </Link>
            </li>
            <li>
                <Link href="/docs" className="hover:text-primary transition-colors">
                    Docs
                </Link>
            </li>
            <li>
                <Link href="/docs/api" className="hover:text-primary transition-colors">
                    API
                </Link>
            </li>
        </MarketingLayoutFooterLinkColumn>
    );
}

export function MarketingLayoutFooterSolutionsColumn() {
    return (
        <MarketingLayoutFooterLinkColumn title="Solutions">
            <li>
                <Link href="/industries" className="hover:text-primary transition-colors">
                    By Industry
                </Link>
            </li>
            <li>
                <Link href="/industries/restaurants" className="hover:text-primary transition-colors">
                    Restaurants
                </Link>
            </li>
            <li>
                <Link href="/industries/dental" className="hover:text-primary transition-colors">
                    Dental
                </Link>
            </li>
            <li>
                <Link href="/industries/auto-repair" className="hover:text-primary transition-colors">
                    Auto Repair
                </Link>
            </li>
            <li>
                <Link href="/industries/salons" className="hover:text-primary transition-colors">
                    Salons & Spas
                </Link>
            </li>
            <li>
                <Link href="/industries/home-services" className="hover:text-primary transition-colors">
                    Home Services
                </Link>
            </li>
            <li>
                <Link href="/industries/hotels" className="hover:text-primary transition-colors">
                    Hotels
                </Link>
            </li>
            <li>
                <Link href="/industries/medical" className="hover:text-primary transition-colors">
                    Medical
                </Link>
            </li>
            <li>
                <Link href="/industries/fitness" className="hover:text-primary transition-colors">
                    Fitness & Gyms
                </Link>
            </li>
            <li>
                <Link href="/compare" className="hover:text-primary transition-colors">
                    Compare Tools
                </Link>
            </li>
        </MarketingLayoutFooterLinkColumn>
    );
}
