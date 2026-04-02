
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils/index";
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

const navItems = [
    {
        title: "General",
        href: "/settings/general",
        icon: Settings2,
    },
    {
        title: "Business Information",
        href: "/settings/business-information",
        icon: Building2,
    },
    {
        title: "Public Profile",
        href: "/settings/public-profile",
        icon: Globe,
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
        <div className="flex flex-col gap-0 p-6">
            {/* Page header */}
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Settings
            </h2>

            {/* Horizontal tab bar */}
            <nav className="flex items-center gap-1 overflow-x-auto border-b border-border pb-0 mb-6 -mx-1 px-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px",
                                isActive
                                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* Settings Content */}
            <div className="flex-1 min-w-0 max-w-4xl">{children}</div>
        </div>
    );
}

