"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./app-sidebar-header";
import { AppSidebarMainNavItems } from "./app-sidebar-main-nav-items";
import { AppSidebarSettingsNavItems } from "./app-sidebar-settings-nav-items";
import { useAppSidebarNav } from "./use-app-sidebar-nav";

export function AppSidebar({
    hideGoogleQaNav,
    ...props
}: React.ComponentProps<typeof Sidebar> & { hideGoogleQaNav?: boolean }) {
    const pathname = usePathname();
    const isSettingsActive = pathname.startsWith("/settings");
    const { items, settingsItems, settingsLabel } = useAppSidebarNav(hideGoogleQaNav);

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border bg-canvas-elevated">
            <SidebarHeader>
                <AppSidebarHeader />
            </SidebarHeader>

            <SidebarContent data-tour-target="tour-sidebar" className="px-2 py-3">
                <AppSidebarMainNavItems items={items} pathname={pathname} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-2">
                <AppSidebarSettingsNavItems
                    items={settingsItems}
                    pathname={pathname}
                    isSettingsActive={isSettingsActive}
                    settingsLabel={settingsLabel}
                />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
