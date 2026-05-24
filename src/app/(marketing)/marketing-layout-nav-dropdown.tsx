"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { RefObject } from "react";
import type { MarketingNavLink } from "./marketing-layout-nav-data";

function NavDropdownLink({
    item,
    onClose,
}: {
    item: MarketingNavLink;
    onClose: () => void;
}) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClose}
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors group"
        >
            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <Icon className="text-primary size-4" />
            </div>
            <div className="min-w-0">
                <div className="font-semibold text-foreground text-[13px] leading-snug">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.desc}</div>
            </div>
        </Link>
    );
}

export function MarketingLayoutNavDropdown({
    label,
    links,
    columns = 1,
    open,
    onToggle,
    onOpen,
    onClose,
    containerRef,
}: {
    label: string;
    links: MarketingNavLink[];
    /** 2 = side-by-side columns (e.g. Product menu with 9 items). */
    columns?: 1 | 2;
    open: boolean;
    onToggle: () => void;
    onOpen: () => void;
    onClose: () => void;
    containerRef: RefObject<HTMLDivElement | null>;
}) {
    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={onToggle}
                onMouseEnter={onOpen}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors ${open ? "text-foreground bg-accent" : ""}`}
            >
                {label}
                <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""} size-3.5`} />
            </button>
            {open && (
                <div
                    onMouseLeave={onClose}
                    className={`absolute left-0 top-full mt-1 rounded-xl border border-border bg-card shadow-xl z-50 p-1.5 ${
                        columns === 2 ? "w-[min(42rem,calc(100vw-2rem))]" : "w-72"
                    }`}
                >
                    <div className={columns === 2 ? "grid grid-cols-2 gap-0.5" : "flex flex-col gap-0.5"}>
                        {links.map((item) => (
                            <NavDropdownLink key={item.href} item={item} onClose={onClose} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
