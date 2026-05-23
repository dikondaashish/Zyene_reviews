"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { RefObject } from "react";
import type { MarketingNavLink } from "./marketing-layout-nav-data";

export function MarketingLayoutNavDropdown({
    label,
    links,
    open,
    onToggle,
    onOpen,
    onClose,
    containerRef,
}: {
    label: string;
    links: MarketingNavLink[];
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
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div
                    onMouseLeave={onClose}
                    className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-50"
                >
                    {links.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className="flex items-start gap-3 px-4 py-3.5 hover:bg-accent transition-colors group"
                            >
                                <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <div className="font-semibold text-foreground text-[13px]">
                                        {item.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {item.desc}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
