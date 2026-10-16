import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Globe,
  LayoutTemplate,
  Lightbulb,
  MessageSquare,
  Plug,
  QrCode,
  Reply,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";

export type WorkspaceModule = {
  icon: LucideIcon;
  title: string;
  text: string;
  tags: string[];
  href: string;
};

/** Mirrors the logged-in app's sidebar. Keep claims in step with the product. */
export const WORKSPACE_MODULES: WorkspaceModule[] = [
  {
    icon: MessageSquare,
    title: "Reviews inbox",
    text: "Google, Facebook and Yelp reviews in one place. Reply yourself or start from an AI suggestion.",
    tags: ["Professional", "Friendly", "Concise"],
    href: "/features/review-monitoring",
  },
  {
    icon: Reply,
    title: "Automatic replies",
    text: "Choose 3+, 4+ or 5-star reviews and a tone. New Google reviews get a reply without you lifting a finger.",
    tags: ["Google", "Star threshold", "Your tone"],
    href: "/features/automatic-review-replies",
  },
  {
    icon: QrCode,
    title: "Review page, QR & NFC",
    text: "A branded page that drafts the review for your customer, with a printable QR code and NFC stands.",
    tags: ["Print", "Download", "NFC stands"],
    href: "/features/review-page",
  },
  {
    icon: Send,
    title: "Review requests",
    text: "Send by SMS, email or both. Pick a saved customer, preview the message, send now or later.",
    tags: ["SMS", "Email", "Preview"],
    href: "/features/review-requests",
  },
  {
    icon: Users,
    title: "Customers & campaigns",
    text: "Keep customers with notes and tags, import or export CSV, and launch campaigns from ready templates.",
    tags: ["Post-visit", "Appointment follow-up", "Re-engagement"],
    href: "/features/customer-crm",
  },
  {
    icon: Lightbulb,
    title: "Smart Insights",
    text: "The themes customers keep mentioning, with suggestions on what to improve next.",
    tags: ["Key themes", "Suggestions", "Broken place links"],
    href: "/features/smart-insights",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    text: "New reviews, rating, response rate and every request from sent to Google, by SMS, email and QR link.",
    tags: ["Request funnel", "PDF", "CSV"],
    href: "/features/analytics",
  },
  {
    icon: TrendingUp,
    title: "Competitors",
    text: "Compare ratings and review volume, see your search terms, and get alerts when a rival's reviews spike.",
    tags: ["Market brief", "Threshold alerts", "Recent events"],
    href: "/features/competitor-tracking",
  },
  {
    icon: Globe,
    title: "Google SEO & AEO",
    text: "A Google profile score and audit, plus prompt tracking that shows if ChatGPT, Perplexity or Gemini mention you.",
    tags: ["Profile score", "AI prompts", "llms.txt"],
    href: "/features/ai-visibility",
  },
  {
    icon: LayoutTemplate,
    title: "Website widgets",
    text: "20 ready-made review widgets, from carousels to review walls. Restyle them and paste one snippet.",
    tags: ["Carousel", "Grid", "Badge"],
    href: "/features/review-widgets",
  },
  {
    icon: Plug,
    title: "Integrations & API",
    text: "Google, Facebook and Yelp, Square in early access, webhooks for Zapier, and a REST API with your own key.",
    tags: ["Square", "Zapier webhooks", "REST API"],
    href: "/integrations",
  },
];
