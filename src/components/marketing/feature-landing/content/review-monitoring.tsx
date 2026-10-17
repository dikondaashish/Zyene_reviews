import {
  BellRing, Download, Inbox, LockKeyhole, Mail, Moon, Plug, RefreshCw, Reply, Smartphone, Sparkles,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  MonitoringHeroVisual, MonitoringPlatformsVisual, MonitoringTriageVisual,
} from "@/components/marketing/feature-landing/visuals/review-monitoring-visuals";

export const REVIEW_MONITORING_CONTENT: FeatureLandingContent = {
  slug: "review-monitoring",
  hero: {
    kicker: "Review inbox & alerts",
    headline: "Every review in one inbox.",
    lede: "Google, Facebook and Yelp reviews in one list, with alerts when new ones arrive and private feedback in its own tab.",
    visual: <MonitoringHeroVisual />,
    visualLabel: "Review inbox with Google, Facebook and Yelp reviews and a text alert for a 2-star review",
  },
  flow: {
    title: "From a new review to a clear inbox",
    intro: "Connect your profiles once. After that, new reviews come to you.",
    steps: [
      { icon: Plug, title: "Connect your profiles", text: "Sign in with Google and Facebook, and find your business on Yelp.", sample: "Google · Facebook · Yelp" },
      { icon: RefreshCw, title: "Reviews sync in", text: "New reviews land in your inbox. Need them sooner? Click Sync Reviews.", sample: "Sync Reviews" },
      { icon: BellRing, title: "You get an alert", text: "An email for each new review, plus a text for low or urgent ones if you turn texts on.", sample: "New 2★ review for Corner Bakery" },
      { icon: Reply, title: "Reply or set aside", text: "Answer Google reviews right in the inbox. Mark the rest as ignored to keep the list clean.", sample: "Needs reply → Responded" },
      { icon: Download, title: "Export any time", text: "Download public reviews or private feedback as a CSV file.", sample: "Export CSV" },
    ],
  },
  rows: [
    {
      eyebrow: "Alerts",
      title: "Hear about a new review while you’re still on the floor",
      text: "Email alerts tell you as soon as a new review or private feedback comes in. Text alerts are for the ones that can’t wait: 1 and 2 star reviews, and reviews our AI scores as urgent.",
      points: [
        "Email alerts for each new review and private feedback",
        "Text alerts at the urgency level you pick, from 5 to 10",
        "Quiet hours pause texts overnight; emails still arrive",
        "A weekly digest of the last 7 days, usually on Monday morning",
      ],
      media: {
        kind: "photo",
        src: "/marketing/home/hero-local-owner.webp",
        alt: "A shop owner smiling at his phone behind the pastry counter of a small bakery",
        objectPosition: "center 30%",
        overlay: (
          <>
            <OverlayCard icon={Smartphone} tone="dark" title="New 2★ review for Corner Bakery" text="“Waited twenty minutes for a coffee…”" />
            <OverlayCard icon={Mail} title="Email alert" text="Open the review and reply from your dashboard" />
          </>
        ),
      },
    },
    {
      eyebrow: "Platforms",
      title: "Google, Facebook and Yelp side by side",
      text: "Every review shows where it came from. What you can do next depends on the platform, and the inbox is clear about it.",
      points: [
        "Google: reply from Zyene and it posts to your Business Profile",
        "Facebook: page recommendations sync as 5 stars (recommends) or 1 star (doesn’t)",
        "Yelp: the 3 most recent reviews per check, which is the most Yelp’s API allows",
      ],
      media: { kind: "visual", node: <MonitoringPlatformsVisual />, label: "Connection cards for Google, Facebook and Yelp showing what each supports" },
    },
    {
      eyebrow: "Stay on top",
      title: "Filter, search and clear the pile",
      text: "The inbox opens on reviews that still need a reply. Narrow it by star rating, sort by newest or lowest rated, or search for a name or a word.",
      points: [
        "Needs reply, Responded, Ignored or All",
        "Select several reviews and mark them ignored or pending at once",
        "Export public reviews or private feedback to CSV",
      ],
      media: { kind: "visual", node: <MonitoringTriageVisual />, label: "Review inbox filtered to 3-star reviews with two selected and the bulk action bar showing" },
    },
  ],
  facts: [
    { value: "3", label: "Review platforms in one inbox" },
    { value: "2", label: "Tabs: public reviews and private feedback" },
    { value: "5–10", label: "Urgency levels you can set for text alerts" },
    { value: "7 days", label: "Of new reviews in each weekly digest" },
  ],
  capabilities: {
    title: "What the inbox gives you",
    items: [
      { icon: Inbox, title: "One list", text: "Google, Facebook and Yelp reviews for the business selected in the header." },
      { icon: LockKeyhole, title: "Private feedback tab", text: "Low ratings from your review page, with any contact details the customer left." },
      { icon: BellRing, title: "Email and text alerts", text: "Email for each new review. Texts for 1–2 star or urgent reviews." },
      { icon: Moon, title: "Quiet hours", text: "No texts in the hours you choose. Emails and the digest are not affected." },
      { icon: Sparkles, title: "Urgency scoring", text: "AI reads each review for sentiment, themes and urgency. Urgency decides which reviews send a text." },
      { icon: Download, title: "CSV export", text: "Public reviews or private feedback, ready for a spreadsheet." },
    ],
  },
  demoTab: "reviews",
  note: "Replies post to Google from Zyene. Facebook and Yelp reviews are for monitoring, so reply on those sites. Yelp’s API returns only the 3 most recent reviews per check, so older Yelp reviews may not appear. Text alerts need a phone number with a country code.",
  faqs: [
    { question: "Which review sites does Zyene monitor?", answer: "Google Business Profile, Facebook pages and Yelp. All three show up in one Reviews inbox for each business, with a badge showing where each review came from." },
    { question: "Can I reply to Facebook and Yelp reviews from Zyene?", answer: "Not yet. Replies you write in Zyene post to Google. Facebook and Yelp reviews are there so you can see them in one place; reply to them on Facebook or on yelp.com." },
    { question: "How do review alerts work?", answer: "Everyone with access to the business gets an email when a new review or private feedback arrives, unless they turn it off. You can also turn on text alerts with your phone number. Texts go out for 1 and 2 star reviews and for reviews at or above the urgency level you pick, except during your quiet hours." },
    { question: "Why do I only see a few Yelp reviews?", answer: "Yelp’s API returns at most the 3 most recent reviews each time we check. Zyene keeps the ones it has already collected, but older Yelp reviews may never come through." },
    { question: "Can I export my reviews?", answer: "Yes. The Export CSV button on the Reviews page downloads public reviews, or private feedback when you are on that tab." },
    { question: "What is private feedback?", answer: "When a customer rates you below the threshold you set on your review page, they see a private form instead of a link to Google. Their message lands in the Private feedback tab, and your team gets an alert." },
  ],
  related: ["ai-replies", "automatic-review-replies", "analytics"],
};
