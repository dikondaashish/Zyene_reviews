"use client";

import Link from "next/link";
import { ChevronDown, Settings } from "lucide-react";

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AppSidebarNavItem } from "./app-sidebar-types";
import { appSidebarNavButtonClass } from "./app-sidebar-nav-utils";

export function AppSidebarSettingsNavItems({
    items,
    pathname,
    isSettingsActive,
    settingsLabel,
}: {
    items: AppSidebarNavItem[];
    pathname: string;
    isSettingsActive: boolean;
    settingsLabel: string;
}) {
    return (
        <SidebarMenu>
            <Collapsible defaultOpen={isSettingsActive} className="group/collapsible">
                <SidebarMenuItem data-tour-target="tour-settings-nav">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            className={appSidebarNavButtonClass(isSettingsActive)}
                            tooltip={settingsLabel}
                        >
                            <Settings className={isSettingsActive ? "text-primary" : ""} />
                            <span className={isSettingsActive ? "font-semibold" : ""}>{settingsLabel}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {items.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={appSidebarNavButtonClass(isActive)}
                                        >
                                            <Link href={item.url}>
                                                <item.icon
                                                    className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                                                />
                                                <span className={isActive ? "font-semibold" : ""}>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                );
                            })}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    );
}
