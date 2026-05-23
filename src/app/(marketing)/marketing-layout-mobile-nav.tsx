"use client";

import Link from "next/link";
import { MarketingHeaderAuth } from "@/components/marketing/marketing-header-auth";
import {
    PRODUCT_LINKS,
    RESOURCES_LINKS,
    SOLUTIONS_LINKS,
    type MarketingNavLink,
} from "./marketing-layout-nav-data";

function MobileNavSection({
    title,
    links,
    onNavigate,
}: {
    title: string;
    links: MarketingNavLink[];
    onNavigate: () => void;
}) {
    return (
        <>
            <p className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {title}
            </p>
            {links.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2"
                    onClick={onNavigate}
                >
                    {item.label}
                </Link>
            ))}
        </>
    );
}

export function MarketingLayoutMobileNav({
    loginUrl,
    signupUrl,
    onNavigate,
}: {
    loginUrl: string;
    signupUrl: string;
    onNavigate: () => void;
}) {
    return (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-0.5">
            <MobileNavSection title="Product" links={PRODUCT_LINKS} onNavigate={onNavigate} />
            <div className="pt-1 border-t border-border/50 mt-1" />
            <MobileNavSection title="Solutions" links={SOLUTIONS_LINKS} onNavigate={onNavigate} />
            <div className="pt-1 border-t border-border/50 mt-1" />
            <MobileNavSection title="Resources" links={RESOURCES_LINKS} onNavigate={onNavigate} />
            <div className="pt-1 border-t border-border/50 mt-1" />
            <Link
                href="/about"
                className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2"
                onClick={onNavigate}
            >
                About
            </Link>
            <Link
                href="/contact"
                className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2"
                onClick={onNavigate}
            >
                Contact
            </Link>
            <div className="pt-1 border-t border-border/50 mt-1">
                <MarketingHeaderAuth
                    loginUrl={loginUrl}
                    signupUrl={signupUrl}
                    variant="mobile"
                    onNavigate={onNavigate}
                />
            </div>
        </div>
    );
}
