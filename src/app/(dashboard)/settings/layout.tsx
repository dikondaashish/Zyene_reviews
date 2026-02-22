
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Building2,
    Bell,
    CreditCard,
    Settings2,
    Users,
    Globe,
} from "lucide-react";

interface SettingsLayoutProps {
    children: React.ReactNode;
}

const sidebarNavItems = [
    {
        title: "General",
        href: "/settings/general",
        icon: Settings2,
    },
    {
        title: "Business Information",
        href: "/settings/business-information",
        icon: Building2,
        children: [
            {
                title: "Public Profile",
                href: "/settings/public-profile",
                icon: Globe,
            },
        ],
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
    },
    {
        title: "Billing",
        href: "/settings/billing",
        icon: CreditCard,
    },
    {
        title: "Team",
        href: "/settings/team",
        icon: Users,
    },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-6">
            {/* Settings Mini Sidebar */}
            <aside className="lg:w-56 shrink-0">
                <div className="lg:sticky lg:top-6">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3 hidden lg:block">
                        Settings
                    </h2>
                    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        {sidebarNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isParentActive = item.children?.some(
                                (child) => pathname === child.href
                            );
                            const Icon = item.icon;

                            return (
                                <div key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                                            isActive || isParentActive
                                                ? "bg-white text-foreground shadow-sm border border-border/50"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {item.title}
                                    </Link>
                                    {item.children && (
                                        <div className="ml-3 mt-1 flex flex-col gap-0.5">
                                            {item.children.map((child) => {
                                                const childActive = pathname === child.href;
                                                const ChildIcon = child.icon;
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cn(
                                                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors whitespace-nowrap border-l-2 ml-2",
                                                            childActive
                                                                ? "border-blue-600 text-blue-700 bg-blue-50 font-medium"
                                                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/60"
                                                        )}
                                                    >
                                                        <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                                        {child.title}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </aside>
            {/* Settings Content */}
            <div className="flex-1 min-w-0 max-w-3xl">{children}</div>
        </div>
    );
}
