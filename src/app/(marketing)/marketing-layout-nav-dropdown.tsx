"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { MarketingNavLink } from "@/app/(marketing)/marketing-layout-nav-data";
import type { MarketingNavMenu } from "@/app/(marketing)/marketing-layout-nav-types";

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
                <div className="font-semibold text-foreground text-sm leading-snug">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.desc}</div>
            </div>
        </Link>
    );
}

export function MarketingLayoutNavDropdown({
    label,
    menu,
    links,
    columns = 1,
    open,
    onToggle,
    onClose,
}: {
    label: string;
    menu: MarketingNavMenu;
    links: MarketingNavLink[];
    columns?: 1 | 2;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    return (
        <div className="relative" data-nav-menu={menu}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onClose(); }}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    event.stopPropagation();
                    onClose();
                    event.currentTarget.querySelector("button")?.focus();
                }
            }}>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={`marketing-menu-${menu}`}
                className={`flex items-center gap-1.5 px-3 py-3 rounded-md hover:bg-accent hover:text-foreground transition-colors ${open ? "text-foreground bg-accent" : ""}`}
            >
                {label}
                <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""} size-3.5`} />
            </button>
            {open ? (
                <div id={`marketing-menu-${menu}`} className="absolute left-0 top-full z-50 pt-2">
                    <div
                        className={`rounded-xl border border-border bg-card shadow-xl p-3 ${
                            columns === 2 ? "w-[540px]" : "w-72"
                        }`}
                    >
                        <div
                            className={
                                columns === 2 ? "grid grid-cols-2 gap-0.5" : "flex flex-col gap-0.5"
                            }
                        >
                            {links.map((item) => (
                                <NavDropdownLink key={item.href} item={item} onClose={onClose} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
