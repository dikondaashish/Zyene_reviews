"use client";

import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import type { AppSidebarNavItem } from "@/components/dashboard/app-sidebar-types";
import { appSidebarNavItemIsActive } from "@/components/dashboard/app-sidebar-nav-utils";

const PRIMARY_URLS = ["/dashboard", "/businesses", "/customers", "/campaigns"];

export function AppSidebarMainNavItems({ items, pathname }: { items: AppSidebarNavItem[]; pathname: string }) {
    const { setOpenMobile } = useSidebar();
    const groups = [
        { id: "workspace", items: items.filter(item => PRIMARY_URLS.includes(item.url)) },
        { id: "reputation", items: items.filter(item => !PRIMARY_URLS.includes(item.url)) },
    ];

    return (
        <div id="app-sidebar-navigation" className="app-sidebar-groups">
            {groups.filter(group => group.items.length > 0).map(group => (
                <ul key={group.id} className="app-sidebar-menu">
                    {group.items.map(item => {
                        const isActive = appSidebarNavItemIsActive(pathname, item.url);
                        return (
                            <li key={item.url} data-tour-target={item.tourTarget}>
                                <Link href={item.url} className="app-sidebar-link" aria-current={isActive ? "page" : undefined}
                                    onClick={() => setOpenMobile(false)}>
                                    <item.icon className="app-sidebar-icon" />
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            ))}
        </div>
    );
}
