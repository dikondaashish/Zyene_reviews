"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LOGIN_URL, SIGNUP_URL } from "@/config/env";
import { MARKETING_PREFETCH_HREFS } from "./marketing-layout-nav-data";
import type { MarketingNavMenu } from "./marketing-layout-nav-types";
import { MarketingLayoutHeaderBrand } from "./marketing-layout-header-brand";
import { MarketingLayoutDesktopNav } from "./marketing-layout-desktop-nav";
import { MarketingLayoutMobileNav } from "./marketing-layout-mobile-nav";

export function MarketingLayoutHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<MarketingNavMenu | null>(null);
    const desktopNavRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        MARKETING_PREFETCH_HREFS.forEach((href) => router.prefetch(href));
    }, [router]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const closeMobile = () => setMobileMenuOpen(false);

    const openOnly = (menu: MarketingNavMenu) => setOpenMenu(menu);

    const toggleMenu = (menu: MarketingNavMenu) => {
        setOpenMenu((current) => (current === menu ? null : menu));
    };

    return (
        <header className="sticky top-0 z-50 w-full min-w-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="container mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between gap-2 px-4 sm:px-8">
                <MarketingLayoutHeaderBrand />
                <MarketingLayoutDesktopNav
                    ref={desktopNavRef}
                    loginUrl={LOGIN_URL}
                    signupUrl={SIGNUP_URL}
                    openMenu={openMenu}
                    onOpenMenu={openOnly}
                    onToggleMenu={toggleMenu}
                    onCloseMenu={() => setOpenMenu(null)}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="size-6" />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-6"
                        >
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    )}
                </Button>
            </div>
            {mobileMenuOpen ? (
                <MarketingLayoutMobileNav
                    loginUrl={LOGIN_URL}
                    signupUrl={SIGNUP_URL}
                    onNavigate={closeMobile}
                />
            ) : null}
        </header>
    );
}
