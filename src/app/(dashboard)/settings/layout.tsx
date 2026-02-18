
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
        title: "Public Profile",
        href: "/settings/public-profile",
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
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                pathname === item.href
                                    ? "bg-muted hover:bg-muted"
                                    : "hover:bg-transparent hover:underline",
                                "justify-start"
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </aside>
            <div className="flex-1 lg:max-w-4xl">{children}</div>
        </div>
    );
}
