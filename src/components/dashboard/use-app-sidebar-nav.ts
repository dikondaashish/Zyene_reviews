"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    BarChart3,
    Bell,
    Building2,
    CreditCard,
    Globe,
    HelpCircle,
    Home,
    Megaphone,
    MessageSquare,
    Plug,
    Send,
    Store,
    Target,
    User,
    Users,
} from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import type { AppSidebarNavItem } from "./app-sidebar-types";

export function useAppSidebarNav(hideGoogleQaNav?: boolean) {
    const router = useRouter();
    const { dict } = useLanguage();

    const items = React.useMemo<AppSidebarNavItem[]>(() => {
        const base: AppSidebarNavItem[] = [
            { title: dict.nav.dashboard, url: "/dashboard", icon: Home },
            { title: dict.nav.businesses, url: "/businesses", icon: Building2 },
            {
                title: dict.nav.customers,
                url: "/customers",
                icon: Users,
                tourTarget: "tour-customers-nav",
            },
            { title: dict.nav.competitors, url: "/competitors", icon: Target },
            { title: dict.nav.reviews, url: "/reviews", icon: MessageSquare },
            { title: dict.nav.qa, url: "/questions", icon: HelpCircle },
            { title: dict.nav.requests, url: "/requests", icon: Send },
            { title: dict.nav.campaigns, url: "/campaigns", icon: Megaphone },
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
            { title: dict.nav.integrations, url: "/settings/integrations", icon: Plug },
        ];
        if (hideGoogleQaNav) {
            return base.filter((item) => item.url !== "/questions");
        }
        return base;
    }, [dict, hideGoogleQaNav]);

    const settingsItems = React.useMemo<AppSidebarNavItem[]>(
        () => [
            { title: dict.nav.general, url: "/settings/general", icon: User },
            { title: dict.nav.business_info, url: "/settings/business-information", icon: Store },
            { title: dict.nav.public_profile, url: "/settings/public-profile", icon: Globe },
            { title: dict.nav.notifications, url: "/settings/notifications", icon: Bell },
            { title: dict.nav.billing, url: "/settings/billing", icon: CreditCard },
            { title: dict.nav.team, url: "/settings/team", icon: Users },
        ],
        [dict],
    );

    React.useEffect(() => {
        const targets = [...items.map((i) => i.url), ...settingsItems.map((i) => i.url)];
        for (const href of targets) {
            router.prefetch(href);
        }
    }, [items, settingsItems, router]);

    return { items, settingsItems, settingsLabel: dict.nav.settings };
}
