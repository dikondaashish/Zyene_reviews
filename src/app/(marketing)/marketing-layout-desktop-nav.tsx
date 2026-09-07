"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { MarketingHeaderAuth } from "@/components/marketing/marketing-header-auth";
import {
    PRODUCT_LINKS,
    RESOURCES_LINKS,
    SOLUTIONS_LINKS,
} from "@/app/(marketing)/marketing-layout-nav-data";
import type { MarketingNavMenu } from "@/app/(marketing)/marketing-layout-nav-types";
import { MarketingLayoutNavDropdown } from "@/app/(marketing)/marketing-layout-nav-dropdown";

export const MarketingLayoutDesktopNav = forwardRef<
    HTMLDivElement,
    {
        loginUrl: string;
        signupUrl: string;
        openMenu: MarketingNavMenu | null;
        onToggleMenu: (menu: MarketingNavMenu) => void;
        onCloseMenu: () => void;
    }
>(function MarketingLayoutDesktopNav(
    { loginUrl, signupUrl, openMenu, onToggleMenu, onCloseMenu },
    ref
) {
    return (
        <nav
            aria-label="Main navigation"
            ref={ref}
            className="hidden lg:flex items-center gap-1 whitespace-nowrap text-sm font-medium text-muted-foreground"
        >
            <MarketingLayoutNavDropdown
                label="Product"
                menu="product"
                links={PRODUCT_LINKS}
                columns={2}
                open={openMenu === "product"}
                onToggle={() => onToggleMenu("product")}
                onClose={onCloseMenu}
            />
            <MarketingLayoutNavDropdown
                label="Solutions"
                menu="solutions"
                links={SOLUTIONS_LINKS}
                open={openMenu === "solutions"}
                onToggle={() => onToggleMenu("solutions")}
                onClose={onCloseMenu}
            />
            <MarketingLayoutNavDropdown
                label="Resources"
                menu="resources"
                links={RESOURCES_LINKS}
                open={openMenu === "resources"}
                onToggle={() => onToggleMenu("resources")}
                onClose={onCloseMenu}
            />
            <Link href="/pricing" className="px-3 py-3 rounded-md hover:bg-accent hover:text-foreground transition-colors" onClick={onCloseMenu}>
                Pricing
            </Link>
            <Link href="/demo" className="px-3 py-3 rounded-md hover:bg-accent hover:text-foreground transition-colors" onClick={onCloseMenu}>
                Book a demo
            </Link>
            <div className="mx-2 h-5 w-px bg-border" />
            <MarketingHeaderAuth loginUrl={loginUrl} signupUrl={signupUrl} />
        </nav>
    );
});
