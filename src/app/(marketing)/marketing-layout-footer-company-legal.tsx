"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PUBLIC_STATUS_URL } from "./marketing-layout-nav-data";
import { MarketingLayoutFooterLinkColumn } from "./marketing-layout-footer-link-column";

export function MarketingLayoutFooterCompanyColumn() {
    return (
        <MarketingLayoutFooterLinkColumn title="Company">
            <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                    About
                </Link>
            </li>
            <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                </Link>
            </li>
            <li>
                <Link href="/demo" className="hover:text-primary transition-colors">
                    Book a demo
                </Link>
            </li>
            <li>
                <Link href="/enterprise" className="hover:text-primary transition-colors">
                    Enterprise
                </Link>
            </li>
            <li>
                <Link href="/partners" className="hover:text-primary transition-colors">
                    Partners
                </Link>
            </li>
            <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                    Help Center
                </Link>
            </li>
            <li>
                <a
                    href={PUBLIC_STATUS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                >
                    Status
                </a>
            </li>
        </MarketingLayoutFooterLinkColumn>
    );
}

export function MarketingLayoutFooterLegalColumn() {
    return (
        <MarketingLayoutFooterLinkColumn title="Legal">
            <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy
                </Link>
            </li>
            <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms
                </Link>
            </li>
            <li>
                <Link
                    href="/security"
                    className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                    <ShieldCheck className="size-3.5" /> Security
                </Link>
            </li>
            <li>
                <Link href="/data-retention" className="hover:text-primary transition-colors">
                    Data Retention
                </Link>
            </li>
            <li>
                <button
                    type="button"
                    className="cursor-pointer bg-transparent p-0 text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                    onClick={() => {
                        const w = window as Window & { openCookiePreferences?: () => void };
                        if (typeof w.openCookiePreferences === "function") {
                            w.openCookiePreferences();
                        } else {
                            window.dispatchEvent(new Event("zyene:open-cookie-preferences"));
                        }
                    }}
                >
                    Manage cookies
                </button>
            </li>
        </MarketingLayoutFooterLinkColumn>
    );
}
