"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Cpu, Network, Zap } from "lucide-react";

type NavGroup = {
    title: string;
    items: {
        title: string;
        href: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
};

const navigation: NavGroup[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Overview", href: "/docs", icon: FileText },
            { title: "Quickstart", href: "/docs/quickstart" },
            { title: "Install with AI", href: "/docs/install", icon: Zap },
        ],
    },
    {
        title: "Concepts",
        items: [
            { title: "How Zyene Works", href: "/docs/how-it-works", icon: Cpu },
            { title: "Review Graph", href: "/docs/graph" },
            { title: "Content Types", href: "/docs/content-types" },
            { title: "Sync Networks", href: "/docs/sync", icon: Network },
        ],
    },
];

export function DocSidebar() {
    const pathname = usePathname();

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border py-8 pr-6 md:block">
            <nav className="flex flex-col gap-8">
                {navigation.map((group) => (
                    <div key={group.title} className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold tracking-tight text-foreground">
                            {group.title}
                        </h4>
                        <div className="flex flex-col gap-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                                            isActive
                                                ? "bg-secondary text-primary font-medium"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={`h-4 w-4 ${
                                                    isActive ? "text-primary" : "text-muted-foreground"
                                                }`}
                                            />
                                        )}
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
