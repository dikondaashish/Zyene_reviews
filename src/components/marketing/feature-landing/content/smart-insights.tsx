import {
  BookOpenText, Hash, Lightbulb, Link2, MessageSquareQuote, RefreshCw, Smile, Sparkles, Tags, Zap,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  SmartInsightsHeroVisual, SmartInsightsLinksVisual, SmartInsightsSuggestionsVisual,
} from "@/components/marketing/feature-landing/visuals/smart-insights-visuals";

export const SMART_INSIGHTS_CONTENT: FeatureLandingContent = {
  slug: "smart-insights",
  hero: {
    eyebrow: "Smart Insights",
    headline: "Find out what customers keep saying, without reading every review.",
    lede: "Smart Insights reads your recent reviews and sums them up at the top of your dashboard: a two-line headline, the 3 to 5 themes that come up most, real customer quotes, and 2 or 3 suggestions for what to do next.",
    visual: <SmartInsightsHeroVisual />,
    visualLabel: "Example Smart Insights card with a headline, key themes and customer quotes",
  },
  flow: {
    eyebrow: "How it works",
    title: "From a pile of reviews to a short list of next steps",
    intro: "There is nothing to set up. Once you have a few reviews with text, the card appears on your dashboard.",
    steps: [
      { icon: RefreshCw, title: "Reviews sync in", text: "Reviews from your connected platforms are collected for your business.", sample: "Google · Facebook · Yelp" },
      { icon: BookOpenText, title: "AI reads them", text: "It reads up to your 200 most recent reviews that have text. You need at least 5.", sample: "5+ reviews with text" },
      { icon: Tags, title: "Themes appear", text: "The 3 to 5 topics that come up most, each with a mention count and sentiment.", sample: "Friendly baristas · 31 mentions" },
      { icon: Lightbulb, title: "Suggestions follow", text: "2 or 3 next steps, each tagged with urgency, effort and an estimated impact.", sample: "Act now · Effort: Low" },
      { icon: Sparkles, title: "It stays current", text: "Results are kept for up to a day, then rebuilt from your latest reviews.", sample: "Kept up to 24 hours" },
    ],
  },
  rows: [
    {
      eyebrow: "Between orders",
      title: "The pulse of your reviews in the time it takes to pull a shot",
      text: "Open the dashboard and Smart Insights is at the top: a two-part headline about what is going well and what is not, and the themes behind it.",
      points: [
        "3 to 5 themes, each with a mention count",
        "Positive, neutral or negative sentiment for each theme",
        "A one-line summary and two customer quotes per theme",
      ],
      media: {
        kind: "photo",
        src: "/marketing/home/cafe-owner-feedback-candid-v2.webp",
        alt: "A café owner in an apron reading a tablet behind the counter next to the espresso machine",
        objectPosition: "center 30%",
        overlay: (
          <>
            <OverlayCard icon={MessageSquareQuote} title="Key theme: Weekend wait times" text="Negative · quotes from your reviews" tone="caution" />
            <OverlayCard icon={Zap} title="Add a second barista on Saturdays" text="Act now · Effort: Low" tone="dark" />
          </>
        ),
      },
    },
    {
      eyebrow: "Suggestions",
      title: "Two or three next steps, sorted for you",
      text: "Each suggestion says how urgent it is, how much effort it takes and roughly what it could change. Open one to read what customers said about it.",
      points: [
        "Urgency: Act now or When you can",
        "Effort: Low, Medium or High",
        "An estimated impact label written by the AI, like “+0.2 avg stars”",
        "See examples shows the customer quotes behind a suggestion",
      ],
      media: { kind: "visual", node: <SmartInsightsSuggestionsVisual />, label: "Example suggestion cards tagged with urgency, effort and impact" },
    },
    {
      eyebrow: "Google profile check",
      title: "Catch a broken booking link before customers do",
      text: "When Google is connected, each sync quick-checks the action links on your Business Profile, like ordering, booking and reservation links. Links that fail show up in a Broken place links tile on your dashboard.",
      points: [
        "Up to 12 profile action links checked per sync",
        "A link is flagged when it returns an error or does not respond",
        "Manage links takes you to your business information",
      ],
      media: { kind: "visual", node: <SmartInsightsLinksVisual />, label: "Example Google profile links with one failed check and the broken links tile" },
    },
  ],
  facts: [
    { value: "3–5", label: "Key themes in every summary" },
    { value: "2–3", label: "Suggestions tagged urgency, effort and impact" },
    { value: "5", label: "Reviews with text needed to start" },
    { value: "12", label: "Google profile links checked per sync" },
  ],
  capabilities: {
    title: "What Smart Insights gives you",
    items: [
      { icon: Sparkles, title: "A two-part headline", text: "One line on what customers love, one on what they would change." },
      { icon: Hash, title: "Mention counts", text: "How many of the reviews read mention each theme." },
      { icon: Smile, title: "Sentiment per theme", text: "Each theme is marked positive, neutral or negative." },
      { icon: MessageSquareQuote, title: "Real quotes", text: "A short summary and two quotes from your own reviews for every theme." },
      { icon: Lightbulb, title: "Tagged suggestions", text: "Urgency, effort and an estimated impact label, so you know where to start." },
      { icon: Link2, title: "Broken place links", text: "A dashboard tile that counts Google profile links that failed a quick check." },
    ],
  },
  note: "Smart Insights needs an active paid plan or trial and at least 5 reviews with text. It reads up to your 200 most recent reviews with text and keeps results for up to 24 hours. Themes, mention counts and impact labels are written by AI and can be off, so treat them as a starting point. The broken link check needs a connected Google Business Profile.",
  faqs: [
    { question: "How does Smart Insights find themes in my reviews?", answer: "It sends the text of up to your 200 most recent reviews to an AI model, which groups them into 3 to 5 themes. Each theme gets a mention count, a sentiment, a one-line summary and two quotes taken from your reviews." },
    { question: "How often are insights updated?", answer: "Results are kept for up to 24 hours. After that, the next time you open the dashboard they are rebuilt from your latest reviews." },
    { question: "Is the impact label a forecast?", answer: "No. Labels like “+0.2 avg stars” are short estimates written by the AI to show the rough size of an opportunity. They are not calculated from your data and are not a promise." },
    { question: "How many reviews do I need?", answer: "At least 5 reviews with written text. Star-only ratings are not used because there is nothing to read." },
    { question: "Which plans include Smart Insights?", answer: "Smart Insights is available on paid plans and during your trial, including Starter at $29.99 a month." },
    { question: "What counts as a broken place link?", answer: "When Google is connected, each sync checks up to 12 action links on your Business Profile, such as ordering or booking links. A link that returns an error or does not respond is counted on your dashboard." },
  ],
  related: ["analytics", "ai-replies", "local-seo"],
};
