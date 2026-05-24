"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { MarketingHeaderAuth } from "@/components/marketing/marketing-header-auth";
import {
    PRODUCT_LINKS,
    RESOURCES_LINKS,
    SOLUTIONS_LINKS,
} from "./marketing-layout-nav-data";
import type { MarketingNavMenu } from "./marketing-layout-nav-types";
import { MarketingLayoutNavDropdown } from "./marketing-layout-nav-dropdown";

export const MarketingLayoutDesktopNav = forwardRef<
    HTMLDivElement,
    {
        loginUrl: string;
        signupUrl: string;
        openMenu: MarketingNavMenu | null;
        onOpenMenu: (menu: MarketingNavMenu) => void;
        onToggleMenu: (menu: MarketingNavMenu) => void;
        onCloseMenu: () => void;
    }
>(function MarketingLayoutDesktopNav(
    { loginUrl, signupUrl, openMenu, onOpenMenu, onToggleMenu, onCloseMenu },
    ref
) {
    return (
        <nav
            ref={ref}
            className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
            <MarketingLayoutNavDropdown
                label="Product"
                menu="product"
                links={PRODUCT_LINKS}
                columns={2}
                open={openMenu === "product"}
                onOpen={() => onOpenMenu("product")}
                onToggle={() => onToggleMenu("product")}
                onClose={onCloseMenu}
            />
            <MarketingLayoutNavDropdown
                label="Solutions"
                menu="solutions"
                links={SOLUTIONS_LINKS}
                open={openMenu === "solutions"}
                onOpen={() => onOpenMenu("solutions")}
                onToggle={() => onToggleMenu("solutions")}
                onClose={onCloseMenu}
            />
            <MarketingLayoutNavDropdown
                label="Resources"
                menu="resources"
                links={RESOURCES_LINKS}
                open={openMenu === "resources"}
                onOpen={() => onOpenMenu("resources")}
                onToggle={() => onToggleMenu("resources")}
                onClose={onCloseMenu}
            />
            <Link
                href="/about"
                className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors"
                onMouseEnter={onCloseMenu}
            >
                About
            </Link>
            <Link
                href="/contact"
                className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors"
                onMouseEnter={onCloseMenu}
            >
                Contact
            </Link>
            <div className="mx-2 h-5 w-px bg-border" />
            <MarketingHeaderAuth loginUrl={loginUrl} signupUrl={signupUrl} />
        </nav>
    );
});
