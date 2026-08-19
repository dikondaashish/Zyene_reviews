"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, CreditCard, Globe, Settings2, Target, Users } from "lucide-react";

import type { SettingsAccess } from "@/lib/auth/settings-access";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: typeof Settings2;
  permission?: keyof SettingsAccess;
};

const organizationNavItems: NavItem[] = [
  { title: "General", href: "/settings/general", icon: Settings2 },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
    permission: "billing",
  },
];

const businessNavItems: NavItem[] = [
  {
    title: "Business Information",
    href: "/settings/business-information",
    icon: Building2,
  },
  { title: "Public Profile", href: "/settings/public-profile", icon: Globe },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
    permission: "notifications",
  },
  {
    title: "Competitor alerts",
    href: "/settings/competitor-alerts",
    icon: Target,
    permission: "competitorAlerts",
  },
  { title: "Team", href: "/settings/team", icon: Users, permission: "team" },
];

function SettingsTabLinks(props: { items: NavItem[]; pathname: string; access: SettingsAccess }) {
  const links: React.ReactNode[] = [];
  for (const item of props.items) {
    if (item.permission && !props.access[item.permission]) continue;
    const Icon = item.icon;
    const isActive = props.pathname === item.href;
    links.push(
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        {item.title}
      </Link>,
    );
  }
  return links;
}

export function SettingsNavigation(props: { children: React.ReactNode; access: SettingsAccess }) {
  const pathname = usePathname();

  return (
    <div className="flex min-w-0 flex-col gap-0 overflow-x-hidden p-4 sm:p-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</h2>
      <nav
        className="-mx-1 mb-6 flex flex-col gap-5 border-b border-border px-1 pb-0 sm:flex-row sm:items-end sm:gap-8"
        aria-label="Settings sections"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Organization
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            <SettingsTabLinks items={organizationNavItems} pathname={pathname} access={props.access} />
          </div>
        </div>
        <div className="hidden h-9 w-px shrink-0 bg-border sm:mb-2.5 sm:block sm:self-end" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Business</span>
          <span className="sr-only">Applies to the business selected in the header.</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            <SettingsTabLinks items={businessNavItems} pathname={pathname} access={props.access} />
          </div>
        </div>
      </nav>
      <div className="min-w-0 flex-1">{props.children}</div>
    </div>
  );
}
