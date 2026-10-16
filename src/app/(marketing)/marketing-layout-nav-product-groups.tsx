"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3, Bot, Building2, Contact, Globe, Inbox, LayoutTemplate, Lightbulb, Megaphone, Nfc, QrCode,
  Reply, Send, ShieldCheck, Sparkles, Star, TrendingUp,
} from "lucide-react";
import {
  FEATURE_CATEGORIES, featurePillarsByCategory, type FeatureCategory, type FeaturePillarSlug,
} from "@/lib/growth/feature-pillars";
import type { MarketingNavMenu } from "@/app/(marketing)/marketing-layout-nav-types";

export const FEATURE_NAV_ICONS: Record<FeaturePillarSlug, LucideIcon> = {
  "review-collection": ShieldCheck,
  "review-page": Star,
  "qr-code-reviews": QrCode,
  "nfc-review-stands": Nfc,
  "review-requests": Send,
  "review-campaigns": Megaphone,
  "customer-crm": Contact,
  "review-monitoring": Inbox,
  "ai-replies": Bot,
  "automatic-review-replies": Reply,
  analytics: BarChart3,
  "smart-insights": Lightbulb,
  "competitor-tracking": TrendingUp,
  "local-seo": Globe,
  "ai-visibility": Sparkles,
  "review-widgets": LayoutTemplate,
  "multi-location": Building2,
};

const COLUMNS: FeatureCategory[][] = [["collect"], ["respond", "understand"], ["visibility", "grow"]];

/** Platform mega-menu body: every feature page, grouped by category. */
export function MarketingLayoutNavProductGroups({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="mega-feature-groups">
      {COLUMNS.map((column) => (
        <div key={column.join("-")} className="mega-feature-column">
          {column.map((categoryId) => {
            const category = FEATURE_CATEGORIES.find((c) => c.id === categoryId);
            return (
              <div key={categoryId} className="mega-feature-group">
                <p className="mega-feature-group-label">{category?.label}</p>
                {featurePillarsByCategory(categoryId).map((page) => {
                  const Icon = FEATURE_NAV_ICONS[page.slug];
                  return (
                    <Link key={page.slug} href={`/features/${page.slug}`} className="mega-feature-link" onClick={onNavigate}>
                      <Icon size={16} aria-hidden="true" />
                      {page.navLabel}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const FOOTER_LINKS: Partial<Record<MarketingNavMenu, { href: string; label: string }[]>> = {
  product: [
    { href: "/features", label: "All features" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/integrations", label: "Integrations" },
    { href: "/pricing", label: "Pricing" },
  ],
  solutions: [
    { href: "/industries", label: "All industries" },
    { href: "/enterprise", label: "Enterprise" },
    { href: "/compare", label: "Compare platforms" },
  ],
};

export function NavPanelFooterLinks({ menu, onNavigate }: { menu: MarketingNavMenu; onNavigate: () => void }) {
  const links = FOOTER_LINKS[menu];
  if (!links) return <>A better reputation starts with a conversation.</>;
  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href} onClick={onNavigate}>
          {link.label}
        </Link>
      ))}
    </>
  );
}
