"use client"

import * as React from "react"
import {
    BarChart3,
    Bell,
    Building2,
    ChevronDown,
    CreditCard,
    Home,
    Megaphone,
    MessageSquare,
    Plug,
    Send,
    Settings,
    Store,
    User,
    Users,
    Target,
    Menu,
    X,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Businesses",
        url: "/businesses",
        icon: Building2,
    },
    {
        title: "Customers",
        url: "/customers",
        icon: Users,
    },
    {
        title: "Competitors",
        url: "/competitors",
        icon: Target,
    },
    {
        title: "Reviews",
        url: "/reviews",
        icon: MessageSquare,
    },
    {
        title: "Review Requests",
        url: "/requests",
        icon: Send,
    },
    {
        title: "Campaigns",
        url: "/campaigns",
        icon: Megaphone,
    },
    {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
    },
    {
        title: "Integrations",
        url: "/integrations",
        icon: Plug,
    },
]

const settingsItems = [
    {
        title: "General",
        url: "/settings",
        icon: User,
    },
    {
        title: "Business Info",
        url: "/settings/business-information",
        icon: Store,
    },
    {
        title: "Notifications",
        url: "/settings/notifications",
        icon: Bell,
    },
    {
        title: "Billing",
        url: "/settings/billing",
        icon: CreditCard,
    },
    {
        title: "Team",
        url: "/settings/team",
        icon: Users,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const isSettingsActive = pathname.startsWith("/settings")

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-gray-200">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                                    <span className="text-lg font-bold text-white">Z</span>
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Zyene Ratings</span>
                                    <span className="text-xs">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent data-tour-target="tour-sidebar">
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    className={`
                                        transition-all duration-150
                                        ${isActive 
                                            ? "bg-orange-50 text-orange-600 border-l-3 border-l-orange-600" 
                                            : "hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <Link href={item.url}>
                                        <item.icon className={isActive ? "text-orange-600" : ""} />
                                        <span className={isActive ? "font-semibold" : ""}>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <Collapsible defaultOpen={isSettingsActive} className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                    className={`
                                        transition-all duration-150
                                        ${isSettingsActive 
                                            ? "bg-orange-50 text-orange-600 border-l-3 border-l-orange-600" 
                                            : "hover:bg-gray-50"
                                        }
                                    `}
                                    tooltip="Settings"
                                >
                                    <Settings className={isSettingsActive ? "text-orange-600" : ""} />
                                    <span className={isSettingsActive ? "font-semibold" : ""}>Settings</span>
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {settingsItems.map((item) => {
                                        const isActive = pathname === item.url;
                                        return (
                                            <SidebarMenuSubItem key={item.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={`
                                                        transition-all duration-150
                                                        ${isActive 
                                                            ? "bg-orange-50 text-orange-600 border-l-3 border-l-orange-600" 
                                                            : "hover:bg-gray-50"
                                                        }
                                                    `}
                                                >
                                                    <Link href={item.url}>
                                                        <item.icon className={`h-4 w-4 ${isActive ? "text-orange-600" : ""}`} />
                                                        <span className={isActive ? "font-semibold" : ""}>{item.title}</span>
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
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}

