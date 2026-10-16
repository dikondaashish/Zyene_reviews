import {
  Activity, BarChart3, BellRing, Brain, Hash, MapPinned, RefreshCw, Search, Sparkles, Star, TrendingUp,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  CompetitorBenchmarkVisual, CompetitorBriefVisual, CompetitorHeroVisual,
} from "@/components/marketing/feature-landing/visuals/competitor-tracking-visuals";

export const COMPETITOR_TRACKING_CONTENT: FeatureLandingContent = {
  slug: "competitor-tracking",
  hero: {
    eyebrow: "Competitor tracking",
    headline: "See how your Google rating stacks up against the shops down the road.",
    lede: "Pick the competitors you care about from Google. Zyene compares your rating and review volume with theirs over time, shows what moved, and alerts you when a rival’s rating jumps or their reviews spike.",
    visual: <CompetitorHeroVisual />,
    visualLabel: "Example rating comparison of four auto shops with a review spike alert",
  },
  flow: {
    eyebrow: "How it works",
    title: "From a business name to a market view",
    intro: "Owners and admins add competitors once. After that, the competitor check keeps their numbers up to date.",
    steps: [
      { icon: Search, title: "Find the listing", text: "Start typing a business name and pick the right Google listing. The name and Maps link fill in for you.", sample: "Eastgate Auto Care" },
      { icon: RefreshCw, title: "Numbers refresh", text: "Ratings and review counts come from Google Maps data, on the regular competitor check or when you press Sync from Google.", sample: "Sync from Google" },
      { icon: BarChart3, title: "Compare", text: "Rating and review volume charts put you next to every competitor for the period you pick.", sample: "You 4.7 · rank #2" },
      { icon: BellRing, title: "Get alerted", text: "A competitor that crosses your thresholds triggers a rating surge or review spike alert.", sample: "Review spike · +24" },
      { icon: Sparkles, title: "Read the brief", text: "Generate an AI market positioning brief with suggested moves.", sample: "Generate brief" },
    ],
  },
  rows: [
    {
      eyebrow: "While you work",
      title: "Know when a competitor makes a move",
      text: "When the competitor check sees a rating jump or a burst of new reviews above your thresholds, it records an alert and can email your team. Smaller changes still show up in the event timeline.",
      points: [
        "Rating surge and review spike alerts",
        "Set both thresholds in Settings → Competitor alerts (defaults: +0.2 stars and +20 reviews)",
        "Every rating and review count change listed in Recent Competitor Events",
      ],
      media: {
        kind: "photo",
        src: "/images/industries/auto-repair-candid-v2.webp",
        alt: "A mechanic working under the open hood of a car in a repair shop",
        objectPosition: "center 30%",
        overlay: (
          <>
            <OverlayCard icon={TrendingUp} title="Eastgate Auto Care review spike alert" text="Review volume passed your threshold" tone="caution" />
            <OverlayCard icon={Star} title="Riverside Motors rating changed" text="Added to Recent Competitor Events" tone="dark" />
          </>
        ),
      },
    },
    {
      eyebrow: "AI market positioning brief",
      title: "A short read on where you stand",
      text: "The brief looks at your Google search terms and the public listing data for your competitors, like ratings, review counts and categories, then explains how you compare and what to try next.",
      points: [
        "A headline, an overview and positioning points",
        "Suggested moves, each with a short reason",
        "Your Google search terms with monthly impressions, from your Business Profile",
      ],
      media: { kind: "visual", node: <CompetitorBriefVisual />, label: "Example AI market positioning brief next to Google search terms" },
    },
    {
      eyebrow: "Market benchmark",
      title: "Your rank, the market and who is gaining",
      text: "Pick 7 days, 30 days, 90 days or 12 months. Market Benchmark shows your rank by rating and how you compare with the market. Market Movement shows each competitor’s rating and review change.",
      points: [
        "Rating Comparison and Review Volume Comparison charts",
        "A Tracked Competitors table with category, rating, reviews, website and Maps link",
        "Export competitor data as CSV",
      ],
      media: { kind: "visual", node: <CompetitorBenchmarkVisual />, label: "Example market benchmark with rank and review change per competitor" },
    },
  ],
  facts: [
    { value: "2", label: "Alert types: rating surge and review spike" },
    { value: "4", label: "Date ranges, from 7 days to 12 months" },
    { value: "+0.2★ / +20", label: "Default alert thresholds, adjustable" },
    { value: "$29.99", label: "Starter plan, competitor tracking included" },
  ],
  capabilities: {
    title: "What competitor tracking covers",
    items: [
      { icon: MapPinned, title: "Google listing search", text: "Find competitors by name and save their Google Maps listing." },
      { icon: BarChart3, title: "Rating and volume comparison", text: "See your rating and review count next to each competitor over time." },
      { icon: BellRing, title: "Threshold alerts", text: "Rating surge and review spike alerts, with optional email to your team." },
      { icon: Brain, title: "AI Competitor Insights", text: "Short notes on recent competitor movement, with a priority and suggested actions." },
      { icon: Hash, title: "Your search terms", text: "The Google searches that showed your listing, with monthly impressions." },
      { icon: Activity, title: "Last Sync Health", text: "What the latest check scanned and updated, so you know how fresh the data is." },
    ],
  },
  note: "Competitor ratings and review counts come from public Google Maps data and refresh when the competitor check runs or when you press Sync from Google, so this is not a live feed. Owners and admins can add, remove and sync competitors and generate the brief. Zyene compares ratings and review volume only; it cannot see a competitor’s response rate or private data.",
  faqs: [
    { question: "How do I track competitor reviews on Google?", answer: "Open Competitors, choose Track Competitor and start typing the business name. Pick the right Google listing and save. Zyene then compares their rating and review count with yours." },
    { question: "How often is competitor data updated?", answer: "Ratings and review counts refresh when the scheduled competitor check runs, and any time an owner or admin presses Sync from Google. It is not a live feed." },
    { question: "What triggers a competitor alert?", answer: "A rating surge alert fires when a competitor’s rating rises by your threshold or more (0.2 stars by default). A review spike alert fires when their review count grows by your threshold or more (20 by default). Change both in Settings → Competitor alerts." },
    { question: "Can I compare response rates with competitors?", answer: "No. Zyene compares ratings and review volume from public Google data. It cannot see how often a competitor replies." },
    { question: "What is the AI market positioning brief?", answer: "A short AI-written summary of how you compare, based on your Google search terms and your competitors’ public ratings, review counts and categories. It includes positioning points and suggested moves, and you can regenerate it anytime." },
    { question: "Is competitor tracking included in Starter?", answer: "Yes. Competitor tracking is part of every plan, starting with Starter at $29.99 a month." },
  ],
  related: ["local-seo", "analytics", "smart-insights"],
};
