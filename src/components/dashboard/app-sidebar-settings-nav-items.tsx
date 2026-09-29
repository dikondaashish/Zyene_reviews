"use client";

import Link from "next/link";
import { ChevronDown, Settings } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AppSidebarNavItem } from "@/components/dashboard/app-sidebar-types";
import { sidebarFont } from "@/components/dashboard/app-sidebar-font";

export function AppSidebarSettingsNavItems({ items, pathname, isSettingsActive, settingsLabel }: {
    items: AppSidebarNavItem[]; pathname: string; isSettingsActive: boolean; settingsLabel: string;
}) {
    const { state, isMobile, setOpenMobile } = useSidebar();
    const contents = <><Settings aria-hidden="true" className="app-sidebar-icon" /><span>{settingsLabel}</span></>;

    if (state === "collapsed" && !isMobile) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button" className="app-sidebar-link" data-active={isSettingsActive} data-tour-target="tour-settings-nav">{contents}</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" sideOffset={12} className={`w-60 rounded-xl p-2 ${sidebarFont.className}`}>
                    <DropdownMenuLabel>{settingsLabel}</DropdownMenuLabel>
                    {items.map(item => (
                        <DropdownMenuItem key={item.url} asChild className="min-h-11 gap-3 rounded-lg">
                            <Link href={item.url} aria-current={pathname === item.url ? "page" : undefined}>
                                <item.icon className="size-5" /><span>{item.title}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Collapsible defaultOpen={isSettingsActive} className="group/settings" data-tour-target="tour-settings-nav">
            <CollapsibleTrigger asChild>
                <button type="button" className="app-sidebar-link" data-active={isSettingsActive}>
                    {contents}<ChevronDown aria-hidden="true" className="ml-auto size-4 group-data-[state=open]/settings:rotate-180" />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <ul className="app-sidebar-settings-list">
                    {items.map(item => (
                        <li key={item.url}>
                            <Link href={item.url} className="app-sidebar-link" aria-current={pathname === item.url ? "page" : undefined}
                                onClick={() => setOpenMobile(false)}>
                                <item.icon className="app-sidebar-icon" /><span>{item.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </CollapsibleContent>
        </Collapsible>
    );
}
