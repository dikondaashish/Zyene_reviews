"use client"

import * as React from "react"
import {
    BarChart3,
    Bell,
    Building2,
    ChevronDown,
    CreditCard,
    HelpCircle,
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
    Globe,
    Plus,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

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
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

type NavItem = {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    tourTarget?: string
}

function navButtonClass(isActive: boolean) {
    return `
        transition-all duration-150
        ${isActive
            ? "bg-sidebar-accent text-orange-500 border-l-2 border-l-orange-500"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }
    `
}

function MainNavItems({ items, pathname }: { items: NavItem[]; pathname: string }) {
    return (
        <SidebarMenu>
            {items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                    <SidebarMenuItem key={item.title} data-tour-target={item.tourTarget}>
                        <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            className={navButtonClass(isActive)}
                        >
                            <Link href={item.url}>
                                <item.icon className={isActive ? "text-orange-600" : ""} />
                                <span className={isActive ? "font-semibold" : ""}>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            })}
        </SidebarMenu>
    )
}

function SettingsNavItems({
    items,
    pathname,
    isSettingsActive,
    settingsLabel,
}: {
    items: NavItem[]
    pathname: string
    isSettingsActive: boolean
    settingsLabel: string
}) {
    return (
        <SidebarMenu>
            <Collapsible defaultOpen={isSettingsActive} className="group/collapsible">
                <SidebarMenuItem data-tour-target="tour-settings-nav">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            className={navButtonClass(isSettingsActive)}
                            tooltip={settingsLabel}
                        >
                            <Settings className={isSettingsActive ? "text-orange-600" : ""} />
                            <span className={isSettingsActive ? "font-semibold" : ""}>{settingsLabel}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {items.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={navButtonClass(isActive)}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={`h-4 w-4 ${isActive ? "text-orange-600" : ""}`} />
                                                <span className={isActive ? "font-semibold" : ""}>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                )
                            })}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { dict } = useLanguage()
    const isSettingsActive = pathname.startsWith("/settings")

    // Memoize menu metadata so child renders only depend on pathname/language changes.
    const items = React.useMemo<NavItem[]>(() => [
        {
            title: dict.nav.dashboard,
            url: "/dashboard",
            icon: Home,
        },
        {
            title: dict.nav.businesses,
            url: "/businesses",
            icon: Building2,
        },
        {
            title: dict.nav.customers,
            url: "/customers",
            icon: Users,
            tourTarget: "tour-customers-nav",
        },
        {
            title: dict.nav.competitors,
            url: "/competitors",
            icon: Target,
        },
        {
            title: dict.nav.reviews,
            url: "/reviews",
            icon: MessageSquare,
        },
        {
            title: dict.nav.qa,
            url: "/questions",
            icon: HelpCircle,
        },
        {
            title: dict.nav.requests,
            url: "/requests",
            icon: Send,
        },
        {
            title: dict.nav.campaigns,
            url: "/campaigns",
            icon: Megaphone,
        },
        {
            title: dict.nav.analytics,
            url: "/analytics",
            icon: BarChart3,
            tourTarget: "tour-analytics-nav",
        },
        {
            title: dict.nav.integrations,
            url: "/integrations",
            icon: Plug,
        },
    ], [dict])

    const settingsItems = React.useMemo<NavItem[]>(() => [
        {
            title: dict.nav.general,
            url: "/settings",
            icon: User,
        },
        {
            title: dict.nav.business_info,
            url: "/settings/business-information",
            icon: Store,
        },
        {
            title: dict.nav.public_profile,
            url: "/settings/public-profile",
            icon: Globe,
        },
        {
            title: dict.nav.notifications,
            url: "/settings/notifications",
            icon: Bell,
        },
        {
            title: dict.nav.billing,
            url: "/settings/billing",
            icon: CreditCard,
        },
        {
            title: dict.nav.team,
            url: "/settings/team",
            icon: Users,
        },
    ], [dict])

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                                    <span className="text-lg font-bold text-white">Z</span>
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Zyene Reviews</span>
                                    <span className="text-xs">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent data-tour-target="tour-sidebar">
                <MainNavItems items={items} pathname={pathname} />
            </SidebarContent>

            <SidebarFooter>
                <SettingsNavItems
                    items={settingsItems}
                    pathname={pathname}
                    isSettingsActive={isSettingsActive}
                    settingsLabel={dict.nav.settings}
                />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}

