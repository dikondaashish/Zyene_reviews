"use client";

import Link from "next/link";

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AppSidebarNavItem } from "./app-sidebar-types";
import { appSidebarNavButtonClass, appSidebarNavItemIsActive } from "./app-sidebar-nav-utils";

const PRIMARY_URLS = ["/dashboard", "/businesses", "/customers", "/campaigns"];

export function AppSidebarMainNavItems({ items, pathname }: { items: AppSidebarNavItem[]; pathname: string }) {
    const primaryItems = items.filter((item) => PRIMARY_URLS.includes(item.url));
    const secondaryItems = items.filter((item) => !PRIMARY_URLS.includes(item.url));

    return (
        <div className="space-y-4">
            <SidebarMenu>
                {primaryItems.map((item) => {
                    const isActive = appSidebarNavItemIsActive(pathname, item.url);
                    return (
                        <SidebarMenuItem key={item.title} data-tour-target={item.tourTarget}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={appSidebarNavButtonClass(isActive)}
                            >
                                <Link href={item.url}>
                                    <item.icon className={isActive ? "text-primary" : ""} />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>

            <div className="mx-2 border-t border-sidebar-border" />

            <SidebarMenu>
                {secondaryItems.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                    return (
                        <SidebarMenuItem key={item.title} data-tour-target={item.tourTarget}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={appSidebarNavButtonClass(isActive)}
                            >
                                <Link href={item.url}>
                                    <item.icon className={isActive ? "text-primary" : ""} />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </div>
    );
}
