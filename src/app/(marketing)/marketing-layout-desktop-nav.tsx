"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { MarketingHeaderAuth } from "@/components/marketing/marketing-header-auth";
import {
    PRODUCT_LINKS,
    RESOURCES_LINKS,
    SOLUTIONS_LINKS,
} from "./marketing-layout-nav-data";
import { MarketingLayoutNavDropdown } from "./marketing-layout-nav-dropdown";

export function MarketingLayoutDesktopNav({
    loginUrl,
    signupUrl,
    productOpen,
    solutionsOpen,
    resourcesOpen,
    productRef,
    solutionsRef,
    resourcesRef,
    onProductToggle,
    onSolutionsToggle,
    onResourcesToggle,
    onProductOpen,
    onSolutionsOpen,
    onResourcesOpen,
    onProductClose,
    onSolutionsClose,
    onResourcesClose,
}: {
    loginUrl: string;
    signupUrl: string;
    productOpen: boolean;
    solutionsOpen: boolean;
    resourcesOpen: boolean;
    productRef: RefObject<HTMLDivElement | null>;
    solutionsRef: RefObject<HTMLDivElement | null>;
    resourcesRef: RefObject<HTMLDivElement | null>;
    onProductToggle: () => void;
    onSolutionsToggle: () => void;
    onResourcesToggle: () => void;
    onProductOpen: () => void;
    onSolutionsOpen: () => void;
    onResourcesOpen: () => void;
    onProductClose: () => void;
    onSolutionsClose: () => void;
    onResourcesClose: () => void;
}) {
    return (
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <MarketingLayoutNavDropdown
                label="Product"
                links={PRODUCT_LINKS}
                open={productOpen}
                onToggle={onProductToggle}
                onOpen={onProductOpen}
                onClose={onProductClose}
                containerRef={productRef}
            />
            <MarketingLayoutNavDropdown
                label="Solutions"
                links={SOLUTIONS_LINKS}
                open={solutionsOpen}
                onToggle={onSolutionsToggle}
                onOpen={onSolutionsOpen}
                onClose={onSolutionsClose}
                containerRef={solutionsRef}
            />
            <MarketingLayoutNavDropdown
                label="Resources"
                links={RESOURCES_LINKS}
                open={resourcesOpen}
                onToggle={onResourcesToggle}
                onOpen={onResourcesOpen}
                onClose={onResourcesClose}
                containerRef={resourcesRef}
            />
            <Link
                href="/about"
                className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors"
            >
                About
            </Link>
            <Link
                href="/contact"
                className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors"
            >
                Contact
            </Link>
            <div className="mx-2 h-5 w-px bg-border" />
            <MarketingHeaderAuth loginUrl={loginUrl} signupUrl={signupUrl} />
        </nav>
    );
}
