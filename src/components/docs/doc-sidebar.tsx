"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, Cpu, FileText, Network, Puzzle, ScrollText, Sparkles, Zap } from "lucide-react";
import type { DocIconKey } from "@/lib/docs/doc-nav";
import { DOC_NAV_GROUPS } from "@/lib/docs/doc-nav";

const ICONS: Record<DocIconKey, ComponentType<{ className?: string }>> = {
    file: FileText,
    zap: Zap,
    sparkles: Sparkles,
    cpu: Cpu,
    network: Network,
    code: Code2,
    book: BookOpen,
    plug: Puzzle,
    history: ScrollText,
};

function isActivePath(pathname: string, href: string) {
    if (href === "/docs") return pathname === "/docs" || pathname === "/docs/";
    return pathname === href;
}

export function DocSidebar() {
    const pathname = usePathname();

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border py-8 pr-6 md:block">
            <nav className="flex flex-col gap-8">
                {DOC_NAV_GROUPS.map((group) => (
                    <div key={group.title} className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold tracking-tight text-foreground">{group.title}</h4>
                        <div className="flex flex-col gap-1">
                            {group.items.map((item) => {
                                const active = isActivePath(pathname, item.href);
                                const Icon = item.icon ? ICONS[item.icon] : null;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                                            active
                                                ? "bg-secondary font-medium text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        {Icon ? (
                                            <Icon
                                                className={`${active ? "text-primary" : "text-muted-foreground"} size-4`}
                                            />
                                        ) : null}
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
