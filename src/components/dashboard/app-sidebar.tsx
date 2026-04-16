"use client"

import * as React from "react"
import Image from "next/image"
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
    X,
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
    useSidebar,
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
        h-11 rounded-xl px-2 transition-all duration-150
        ${isActive
            ? "bg-sidebar-accent text-primary font-semibold"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }
    `
}

function MainNavItems({ items, pathname }: { items: NavItem[]; pathname: string }) {
    const primaryItems = items.filter((item) =>
        ["/dashboard", "/businesses", "/customers", "/campaigns"].includes(item.url)
    )
    const secondaryItems = items.filter(
        (item) => !["/dashboard", "/businesses", "/customers", "/campaigns"].includes(item.url)
    )

    return (
        <div className="space-y-4">
            <SidebarMenu>
                {primaryItems.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                    return (
                        <SidebarMenuItem key={item.title} data-tour-target={item.tourTarget}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={navButtonClass(isActive)}
                            >
                                <Link href={item.url}>
                                    <item.icon className={isActive ? "text-primary" : ""} />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>

            <div className="mx-2 border-t border-sidebar-border" />

            <SidebarMenu>
                {secondaryItems.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                    return (
                        <SidebarMenuItem key={item.title} data-tour-target={item.tourTarget}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={navButtonClass(isActive)}
                            >
                                <Link href={item.url}>
                                    <item.icon className={isActive ? "text-primary" : ""} />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </div>
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
                            <Settings className={isSettingsActive ? "text-primary" : ""} />
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
                                                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
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

export function AppSidebar({
    hideGoogleQaNav,
    ...props
}: React.ComponentProps<typeof Sidebar> & { hideGoogleQaNav?: boolean }) {
    const pathname = usePathname()
    const { dict } = useLanguage()
    const { setOpenMobile } = useSidebar()
    const isSettingsActive = pathname.startsWith("/settings")

    // Memoize menu metadata so child renders only depend on pathname/language changes.
    const items = React.useMemo<NavItem[]>(() => {
        const base: NavItem[] = [
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
            title: (dict.nav as Record<string, string>).google_seo_aeo || "Google SEO/AEO",
            url: "/google-seo-aeo",
            icon: Globe,
        },
        {
            title: dict.nav.integrations,
            url: "/integrations",
            icon: Plug,
        },
        ]
        if (hideGoogleQaNav) {
            return base.filter((item) => item.url !== "/questions")
        }
        return base
    }, [dict, hideGoogleQaNav])

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
        <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border bg-[#f9f7f3]">
            <SidebarHeader className="relative gap-3 border-b border-sidebar-border p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-border/60">
                                    <Image
                                        src="/Main%20logo.png"
                                        alt="Zyene Reviews"
                                        width={36}
                                        height={36}
                                        className="h-full w-full object-cover"
                                        priority
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Zyene Reviews</span>
                                    <span className="text-xs">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 md:hidden"
                    aria-label="Close sidebar"
                    onClick={() => setOpenMobile(false)}
                >
                    <X className="h-5 w-5" />
                </button>
            </SidebarHeader>

            <SidebarContent data-tour-target="tour-sidebar" className="px-2 py-3">
                <MainNavItems items={items} pathname={pathname} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-2">
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

