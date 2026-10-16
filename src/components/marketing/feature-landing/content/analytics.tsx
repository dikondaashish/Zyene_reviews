import {
  CalendarRange, ChartColumnIncreasing, Code2, Download, FileDown, Filter, Gauge, Layers, ListFilter, MessageCircle, RefreshCw,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  AnalyticsFunnelVisual, AnalyticsGoogleVisual, AnalyticsHeroVisual,
} from "@/components/marketing/feature-landing/visuals/analytics-visuals";

export const ANALYTICS_CONTENT: FeatureLandingContent = {
  slug: "analytics",
  hero: {
    eyebrow: "Analytics & reports",
    headline: "See how many reviews came in, and which requests brought them.",
    lede: "Analytics shows new reviews, average rating, response rate and requests sent for the period you pick. Then it follows every review request from send to the Google hand-off, so you know which channel works.",
    visual: <AnalyticsHeroVisual />,
    visualLabel: "Example analytics screen with four headline numbers and a review volume chart",
  },
  flow: {
    eyebrow: "How it works",
    title: "From synced reviews to a report you can share",
    intro: "Analytics reads the reviews you sync and the requests you send. There is nothing to set up beyond connecting your platforms.",
    steps: [
      { icon: RefreshCw, title: "Reviews sync in", text: "Reviews from the platforms you connect sit next to the requests you send from Zyene.", sample: "Google · Facebook · Yelp" },
      { icon: CalendarRange, title: "Pick a period", text: "Choose 7 days, 30 days, 90 days or 12 months. Each headline number compares with the period before.", sample: "30 Days · vs last period" },
      { icon: Gauge, title: "Read the headline numbers", text: "New Reviews, Average Rating, Response Rate and Requests Sent, at the top of the page.", sample: "4.8 avg · 94% replied" },
      { icon: Filter, title: "Follow each request", text: "The Own Platform tab tracks requests from sent to the Google hand-off, split by SMS, email and link.", sample: "Sent → Clicked → Google" },
      { icon: FileDown, title: "Share the report", text: "Download a PDF of what is on screen, or export daily review data as CSV.", sample: "Download PDF Report" },
    ],
  },
  rows: [
    {
      eyebrow: "Team meetings",
      title: "Bring the numbers to the meeting, not a screenshot",
      text: "Download a PDF of the analytics you are looking at, for the period you picked. Or export the daily review data and build your own charts in a spreadsheet.",
      points: [
        "The PDF captures the charts and numbers on screen",
        "The CSV lists rating and review count per day, split positive, neutral and negative",
        "Developers can pull the same summary from GET /api/v1/analytics",
      ],
      media: {
        kind: "photo",
        src: "/marketing/about/team-collaboration-candid-v2.webp",
        alt: "Three colleagues around a table looking at a laptop while one takes notes",
        objectPosition: "center 40%",
        overlay: (
          <>
            <OverlayCard icon={FileDown} title="Download PDF Report" text="Analytics report · Last 30 days" tone="dark" />
            <OverlayCard icon={Download} title="Export CSV" text="Daily ratings and review counts" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "Review requests",
      title: "See where requests drop off",
      text: "Every request you send moves through six stages. Channel Performance puts SMS, email and link side by side, so you can see which one gets customers to finish.",
      points: [
        "Sent, Delivered, Opened, Link Clicked, Completed and Google handoff",
        "Click and completion rates for each channel; QR code scans count as Link",
        "Rating distribution, the tags customers picked most, low-rating alerts and private feedback",
      ],
      media: { kind: "visual", node: <AnalyticsFunnelVisual />, label: "Example review request funnel and channel performance" },
    },
    {
      eyebrow: "Google Business Profile",
      title: "See how people find you on Google",
      text: "Connect your Google Business Profile and Analytics adds listing performance and the search terms that showed your business.",
      points: [
        "Profile views, website clicks, direction requests and call clicks",
        "Top search keywords with monthly impressions",
        "A discovery vs branded split, estimated from those search terms",
      ],
      media: { kind: "visual", node: <AnalyticsGoogleVisual />, label: "Example Google listing performance and search keywords" },
    },
  ],
  facts: [
    { value: "4", label: "Date ranges, from 7 days to 12 months" },
    { value: "6", label: "Stages in the review request funnel" },
    { value: "3", label: "Channels compared: SMS, email and link" },
    { value: "2", label: "Export formats: PDF and CSV" },
  ],
  capabilities: {
    title: "What you can see in Analytics",
    items: [
      { icon: Gauge, title: "Headline numbers", text: "New Reviews, Average Rating, Response Rate and Requests Sent, each compared with the previous period." },
      { icon: ChartColumnIncreasing, title: "Rating trend and volume", text: "How your rating moves over time, review volume by rating and the share of each star." },
      { icon: ListFilter, title: "Common themes", text: "The topics customers mention most often across your reviews." },
      { icon: Layers, title: "Platform comparison", text: "Each review source side by side when you view all platforms." },
      { icon: MessageCircle, title: "Low ratings and private feedback", text: "Low ratings caught by your review page and what those customers told you." },
      { icon: Code2, title: "Developer API", text: "Read review and request totals for up to 365 days with an API key." },
    ],
  },
  demoTab: "reports",
  note: "Analytics covers the business you have selected; switch businesses to see another location. Google listing performance and search terms need a connected Google Business Profile and are only as fresh as Google’s data. The Google handoff stage counts customers sent to Google, not confirmed posts. QR code scans are counted in the Link channel, not reported separately.",
  faqs: [
    { question: "What does the review analytics dashboard show?", answer: "New reviews, average rating, response rate and requests sent for the period you pick, with rating trends, review volume, common themes and a comparison across platforms. The Own Platform tab adds the review request funnel, channel performance, popular tags, low-rating alerts and private feedback." },
    { question: "Can I download a review report as a PDF?", answer: "Yes. Download PDF Report saves the analytics view you are looking at as a PDF. Export CSV downloads daily rows with the average rating, review count and positive, neutral and negative counts." },
    { question: "Can I see how many people scanned my QR code?", answer: "QR code scans are counted together with other review link visits in the Link channel. Zyene does not report QR scans separately." },
    { question: "Does Zyene show Google Business Profile insights?", answer: "Yes, once Google is connected. You see profile views, website clicks, direction requests and call clicks, plus your top search keywords with monthly impressions." },
    { question: "Can I pull analytics into my own tools?", answer: "Yes. GET /api/v1/analytics returns review and request totals for up to 365 days. Create an API key with the analytics:read scope in Settings → Integrations." },
    { question: "Which plans include analytics?", answer: "Dashboard analytics and CSV exports are included on every plan, starting with Starter at $29.99 a month." },
  ],
  related: ["smart-insights", "competitor-tracking", "review-requests"],
};
