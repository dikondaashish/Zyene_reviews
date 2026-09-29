"use client";

import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { AppSidebarMainNavItems } from "@/components/dashboard/app-sidebar-main-nav-items";
import { AppSidebarSettingsNavItems } from "@/components/dashboard/app-sidebar-settings-nav-items";
import { useAppSidebarNav } from "@/components/dashboard/use-app-sidebar-nav";
import { sidebarFont } from "@/components/dashboard/app-sidebar-font";
import type { SettingsAccess } from "@/lib/auth/settings-access";
import "@/components/dashboard/app-sidebar.css";

export function AppSidebar({ hideGoogleQaNav, settingsAccess, ...props }: ComponentProps<typeof Sidebar> & {
  hideGoogleQaNav?: boolean; settingsAccess: SettingsAccess;
}) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const { items, settingsItems, settingsLabel } = useAppSidebarNav(hideGoogleQaNav, settingsAccess);

  return (
    <Sidebar collapsible="icon" {...props} className="border-sidebar-border bg-sidebar">
      <div data-app-sidebar data-compact={state === "collapsed" && !isMobile} className={`app-sidebar ${sidebarFont.className}`}>
        <AppSidebarHeader />
        <nav aria-label="Main navigation" data-tour-target="tour-sidebar" className="app-sidebar-content">
          <AppSidebarMainNavItems items={items} pathname={pathname} />
        </nav>
        <footer className="app-sidebar-footer">
          <AppSidebarSettingsNavItems items={settingsItems} pathname={pathname}
            isSettingsActive={pathname.startsWith("/settings")} settingsLabel={settingsLabel} />
        </footer>
      </div>
    </Sidebar>
  );
}
