"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChartNoAxesCombined,
  Bell,
  Building2,
  CreditCard,
  Globe,
  HelpCircle,
  Home,
  MessageSquare,
  Plug,
  Send,
  Store,
  Target,
  User,
  Users,
} from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import type { AppSidebarNavItem } from "@/components/dashboard/app-sidebar-types";
import type { SettingsAccess } from "@/lib/auth/settings-access";
import { GET_REVIEWS_URLS } from "@/components/dashboard/get-reviews-tabs";

export function useAppSidebarNav(
  hideGoogleQaNav: boolean | undefined,
  access: SettingsAccess,
) {
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
      // Requests, campaigns and automations are one job for an owner, so one item and shared tabs.
      {
        title: dict.nav.get_reviews,
        url: "/campaigns",
        icon: Send,
        matchUrls: GET_REVIEWS_URLS,
      },
      { title: dict.nav.competitors, url: "/competitors", icon: Target },
      { title: dict.nav.reviews, url: "/reviews", icon: MessageSquare },
      { title: dict.nav.qa, url: "/questions", icon: HelpCircle },
      {
        title: dict.nav.analytics,
        url: "/analytics",
        icon: ChartNoAxesCombined,
        tourTarget: "tour-analytics-nav",
      },
      {
        title:
          (dict.nav as Record<string, string>).google_seo_aeo ||
          "Google SEO/AEO",
        url: "/google-seo-aeo",
        icon: Globe,
      },
    ];
    if (hideGoogleQaNav) {
      return base.filter((item) => item.url !== "/questions");
    }
    return base;
  }, [dict, hideGoogleQaNav]);

  const settingsItems = React.useMemo<AppSidebarNavItem[]>(() => {
    const result: AppSidebarNavItem[] = [
      { title: dict.nav.general, url: "/settings/general", icon: User },
      { title: dict.nav.integrations, url: "/settings/integrations", icon: Plug },
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
    ];
    if (access.notifications) {
      result.push({
        title: dict.nav.notifications,
        url: "/settings/notifications",
        icon: Bell,
      });
    }
    if (access.billing) {
      result.push({
        title: dict.nav.billing,
        url: "/settings/billing",
        icon: CreditCard,
      });
    }
    if (access.team) {
      result.push({ title: dict.nav.team, url: "/settings/team", icon: Users });
    }
    return result;
  }, [access.billing, access.notifications, access.team, dict]);

  React.useEffect(() => {
    const targets = [
      ...items.map((i) => i.url),
      ...settingsItems.map((i) => i.url),
    ];
    for (const href of targets) {
      router.prefetch(href);
    }
  }, [items, settingsItems, router]);

  return { items, settingsItems, settingsLabel: dict.nav.settings };
}
