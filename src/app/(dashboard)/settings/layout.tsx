
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface SettingsLayoutProps {
    children: React.ReactNode;
}

const sidebarNavItems = [
    {
        title: "General",
        href: "/settings/general",
    },
    {
        title: "Business Information",
        href: "/settings/business-information",
        children: [
            {
                title: "Public Profile",
                href: "/settings/public-profile",
            },
        ],
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
    },
    {
        title: "Billing",
        href: "/settings/billing",
    },
    {
        title: "Team",
        href: "/settings/team",
    },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 p-6">
            <aside className="-mx-4 lg:w-1/5">
                <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                    {sidebarNavItems.map((item) => (
                        <div key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    buttonVariants({ variant: "ghost" }),
                                    pathname === item.href
                                        ? "bg-muted hover:bg-muted"
                                        : "hover:bg-transparent hover:underline",
                                    "justify-start w-full"
                                )}
                            >
                                {item.title}
                            </Link>
                            {item.children && (
                                <div className="ml-4 mt-1 flex flex-col space-y-1">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className={cn(
                                                buttonVariants({ variant: "ghost", size: "sm" }),
                                                pathname === child.href
                                                    ? "bg-muted hover:bg-muted"
                                                    : "hover:bg-transparent hover:underline",
                                                "justify-start text-sm pl-4 border-l-2",
                                                pathname === child.href
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-muted-foreground"
                                            )}
                                        >
                                            {child.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>
            <div className="flex-1 lg:max-w-4xl">{children}</div>
        </div>
    );
}
