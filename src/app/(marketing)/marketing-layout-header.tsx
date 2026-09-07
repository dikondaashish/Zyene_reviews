"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { LOGIN_URL, SIGNUP_URL } from "@/config/env";
import type { MarketingNavMenu } from "@/app/(marketing)/marketing-layout-nav-types";
import { MarketingLayoutHeaderBrand } from "@/app/(marketing)/marketing-layout-header-brand";
import { MarketingLayoutDesktopNav } from "@/app/(marketing)/marketing-layout-desktop-nav";
import { MarketingLayoutMobileNav } from "@/app/(marketing)/marketing-layout-mobile-nav";

export function MarketingLayoutHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<MarketingNavMenu | null>(null);
    const desktopNavRef = useRef<HTMLDivElement>(null);
    const mobileTriggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        function onEscape(event: KeyboardEvent) {
            if (event.key !== "Escape") return;
            if (mobileMenuOpen) mobileTriggerRef.current?.focus();
            setMobileMenuOpen(false);
            setOpenMenu(null);
        }
        document.addEventListener("keydown", onEscape);
        return () => document.removeEventListener("keydown", onEscape);
    }, [mobileMenuOpen]);

    const closeMobile = () => setMobileMenuOpen(false);

    const toggleMenu = (menu: MarketingNavMenu) => {
        setOpenMenu((current) => (current === menu ? null : menu));
    };

    return (
        <header className="premium-header sticky top-0 z-50 w-full min-w-0">
            <div className="premium-header-inner">
                <MarketingLayoutHeaderBrand />
                <MarketingLayoutDesktopNav
                    ref={desktopNavRef}
                    loginUrl={LOGIN_URL}
                    signupUrl={SIGNUP_URL}
                    openMenu={openMenu}
                    onToggleMenu={toggleMenu}
                    onCloseMenu={() => setOpenMenu(null)}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    ref={mobileTriggerRef}
                    className="lg:hidden size-11"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="marketing-mobile-nav"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="size-6" />
                    ) : (
                        <Menu className="size-6" />
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
