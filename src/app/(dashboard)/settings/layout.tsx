
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
    Target,
} from "lucide-react";

interface SettingsLayoutProps {
    children: React.ReactNode;
}

const organizationNavItems = [
    {
        title: "General",
        href: "/settings/general",
        icon: Settings2,
    },
    {
        title: "Billing",
        href: "/settings/billing",
        icon: CreditCard,
    },
];

const businessNavItems = [
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
        title: "Competitor alerts",
        href: "/settings/competitor-alerts",
        icon: Target,
    },
    {
        title: "Team",
        href: "/settings/team",
        icon: Users,
    },
];

type NavItem = (typeof organizationNavItems)[number];

function SettingsTabLinks({
    items,
    pathname,
}: {
    items: readonly NavItem[];
    pathname: string;
}) {
    return (
        <>
            {items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px",
                            isActive
                                    ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        <Icon className="shrink-0 size-4" />
                        {item.title}
                    </Link>
                );
            })}
        </>
    );
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex min-w-0 flex-col gap-0 overflow-x-hidden p-4 sm:p-6">
            {/* Page header */}
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Settings
            </h2>

            {/* Org vs business scope: two labeled rows; mirrors product model (one org, many businesses). */}
            <nav
                className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8 border-b border-border pb-0 mb-6 -mx-1 px-1"
                aria-label="Settings sections"
            >
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Organization
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        <SettingsTabLinks
                            items={organizationNavItems}
                            pathname={pathname}
                        />
                    </div>
                </div>

                <div
                    className="hidden h-9 w-px shrink-0 bg-border sm:block sm:self-end sm:mb-2.5"
                    aria-hidden
                />

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Business
                    </span>
                    <span className="sr-only">
                        Applies to the business selected in the header.
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        <SettingsTabLinks
                            items={businessNavItems}
                            pathname={pathname}
                        />
                    </div>
                </div>
            </nav>

            {/* Settings Content */}
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}

