"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MarketingHeaderAuth } from "@/components/marketing/marketing-header-auth";
import { PRODUCT_LINKS, RESOURCES_LINKS, SOLUTIONS_LINKS } from "@/app/(marketing)/marketing-layout-nav-data";

export function MarketingLayoutMobileNav({ loginUrl, signupUrl, onNavigate }: {
    loginUrl: string;
    signupUrl: string;
    onNavigate: () => void;
}) {
    return (
        <nav id="marketing-mobile-nav" aria-label="Main navigation" className="lg:hidden max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-border bg-background px-5 pb-6">
            {[
                { title: "Product", links: PRODUCT_LINKS },
                { title: "Solutions", links: SOLUTIONS_LINKS },
                { title: "Resources", links: RESOURCES_LINKS },
            ].map(({ title, links }) => (
                <details key={title} className="group border-b border-border">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
                        {title}<ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="pb-3">
                        {links.map((item) => (
                            <Link key={item.href} href={item.href} onClick={onNavigate} className="block rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </details>
            ))}
            <div className="grid grid-cols-2 gap-x-4 py-3">
                {[["Pricing", "/pricing"], ["Book a demo", "/demo"], ["About us", "/about"], ["Contact", "/contact"]].map(([label, href]) => (
                    <Link key={href} href={href} onClick={onNavigate} className="py-3 text-sm font-medium">{label}</Link>
                ))}
            </div>
            <MarketingHeaderAuth loginUrl={loginUrl} signupUrl={signupUrl} variant="mobile" onNavigate={onNavigate} />
        </nav>
    );
}
