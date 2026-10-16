import type { LucideIcon } from "lucide-react";
import {
  BarChart3, Bot, Building2, Contact, Globe, Inbox, LayoutTemplate, Lightbulb, Megaphone, Nfc, QrCode,
  Reply, Send, ShieldCheck, Sparkles, Star, TrendingUp,
} from "lucide-react";
import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";

/** Shared by server (/features index) and client (mega menu) code, so it must not live in a "use client" file. */
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
