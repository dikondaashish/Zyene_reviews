import {
  FileText, Gauge, Link2, ListChecks, MapPin, PenLine, Plug, Search, Settings2,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  LocalSeoContentVisual, LocalSeoHeroVisual, LocalSeoSearchVisual,
} from "@/components/marketing/feature-landing/visuals/local-seo-visuals";

export const LOCAL_SEO_CONTENT: FeatureLandingContent = {
  slug: "local-seo",
  hero: {
    kicker: "Google Business Profile SEO",
    headline: "Fix what your Google profile is missing.",
    lede: "Zyene scores your Business Profile, ranks the fixes that matter, and shows the searches, views, calls and directions it brings in.",
    visual: <LocalSeoHeroVisual />,
    visualLabel: "Google profile score with a list of fixes and a broken link alert",
  },
  flow: {
    title: "From a connected profile to a clear to-do list",
    intro: "Everything starts with your Google Business Profile. We read it on each sync and turn it into a short list of things to do.",
    steps: [
      { icon: Plug, title: "Connect Google", text: "Link your Google Business Profile. The same connection syncs your reviews.", sample: "Corner Café · connected" },
      { icon: Gauge, title: "Get your score", text: "Your score is the share of measured checks your profile passes.", sample: "73 / 100" },
      { icon: ListChecks, title: "Fix the top item", text: "The fixes that matter most come first, each linked to where you fix it.", sample: "Review Replies (30d)" },
      { icon: PenLine, title: "Draft better content", text: "AI drafts your description and Google posts. You approve every change.", sample: "Save to Google" },
      { icon: Search, title: "Watch your searches", text: "See the search terms that showed your profile, plus views, calls and directions.", sample: "“coffee near me” · 1,240 imp." },
    ],
  },
  rows: [
    {
      eyebrow: "Profile health",
      title: "A score that tells you what to do next",
      text: "We check your description, recent reviews, rating, reply rate, profile activity, photos, posts, services and service area. Failing checks go to the top of a short list.",
      points: [
        "Up to 11 checks, scored from what Google actually returns",
        "Checks with no data from Google are shown as not scored",
        "Every open item links straight to where you fix it",
      ],
      media: {
        kind: "photo",
        src: "/marketing/home/storefront-candid-v2.webp",
        alt: "Two people having coffee at a small table outside a café with dark green window frames",
        objectPosition: "center 40%",
        overlay: (
          <>
            <OverlayCard icon={MapPin} title="Found on Google Maps" text="Corner Café · 241 direction requests this month" tone="dark" />
            <OverlayCard icon={Link2} title="Broken link found" text="Reservations link flagged on your dashboard" tone="caution" />
          </>
        ),
      },
    },
    {
      eyebrow: "Search & Maps",
      title: "Know which searches show your business",
      text: "Google tells you the search terms that led to your profile and how people acted on it. Zyene puts those numbers next to your reviews.",
      points: [
        "Monthly search terms with impressions, split into discovery and name searches",
        "Profile views, website clicks, calls and direction requests over time",
        "Connect Search Console to also see top searches for your website",
      ],
      media: { kind: "visual", node: <LocalSeoSearchVisual />, label: "Google performance chart with profile views, clicks, calls, directions and search terms" },
    },
    {
      eyebrow: "Content workspace",
      title: "Better words for your profile, on your say-so",
      text: "Draft a clearer description that uses the terms people search for, describe your services, and write Google posts. You read every draft before anything reaches Google.",
      points: [
        "Description drafts built around your real search terms",
        "Service descriptions and post drafts from your Google category",
        "Anything we cannot verify comes back as a placeholder for you to fill",
      ],
      media: { kind: "visual", node: <LocalSeoContentVisual />, label: "A business description before and after an AI suggestion, and a Google post draft" },
    },
  ],
  facts: [
    { value: "11", label: "Checks behind your profile score" },
    { value: "12", label: "Profile action links checked for errors each sync" },
    { value: "4", label: "Google metrics charted: views, clicks, calls, directions" },
    { value: "0", label: "Changes sent to Google without your click" },
  ],
  capabilities: {
    title: "Everything for your Google profile in one place",
    items: [
      { icon: Gauge, title: "Profile score", text: "A 0–100 score from the checks your profile passes, with open items first." },
      { icon: Search, title: "Search terms", text: "The monthly searches that showed your profile, with impressions." },
      { icon: MapPin, title: "Search & Maps performance", text: "Profile views, website clicks, calls and direction requests over time." },
      { icon: Link2, title: "Broken link checks", text: "Action links on your profile are checked on sync and flagged when they fail." },
      { icon: FileText, title: "Description & post drafts", text: "AI drafts you can edit, then save or publish to Google when ready." },
      { icon: Settings2, title: "Listing editor", text: "Edit your title, website, phone, description and action links like reservations." },
    ],
  },
  note: "You need a connected Google Business Profile. Numbers come from Google and refresh when your profile syncs, so a new connection can take a while to fill in. Search term impressions show how often you appeared, not your ranking position. Search Console data appears only after you grant access.",
  faqs: [
    { question: "What does the Google profile score measure?", answer: "It is the share of measured checks your profile passes: description and keywords, reviews in the last 30 days, rating, reply rate, profile activity, photos, posts, services and service area. Checks Google returns no data for are not scored." },
    { question: "Does Zyene show my Google ranking?", answer: "No. It shows the search terms that led to your profile with impressions, plus views, calls, website clicks and directions. Impressions are not rank positions. If you connect Search Console, you also see the average position of your website in Google search." },
    { question: "Can I edit my Google Business Profile from Zyene?", answer: "Yes. You can edit your business title, website, primary phone and description, and add or remove action links such as reservations or online ordering. Changes sync to Google." },
    { question: "Will Zyene post to my Google profile on its own?", answer: "No. AI drafts your description, services and posts, and nothing goes to Google until you click Save to Google or Publish to Google." },
    { question: "How does the broken link check work?", answer: "When your profile syncs, we check up to 12 action links on your listing. Links that return an error are counted on your dashboard so you can fix them." },
  ],
  related: ["ai-visibility", "competitor-tracking", "analytics"],
};
