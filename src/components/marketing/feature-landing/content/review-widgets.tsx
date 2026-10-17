import {
  BadgeCheck, Code2, Filter, Globe, LayoutTemplate, MousePointerClick, Palette, RefreshCw, Sparkles, Star,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import { ReviewWidgetsGalleryVisual, ReviewWidgetsHeroVisual } from "@/components/marketing/feature-landing/visuals/review-widgets-visuals";
import { ReviewWidgetsBuilderVisual } from "@/components/marketing/feature-landing/visuals/review-widgets-builder-visual";

export const REVIEW_WIDGETS_CONTENT: FeatureLandingContent = {
  slug: "review-widgets",
  hero: {
    kicker: "Review widgets",
    headline: "Show your best reviews where people book.",
    lede: "Pick one of 20 ready-made widgets, choose which reviews appear, match your brand, and paste one snippet into your site.",
    visual: <ReviewWidgetsHeroVisual />,
    visualLabel: "Salon website with an embedded Google review carousel and a floating rating badge",
  },
  flow: {
    title: "From template to live on your site in five steps",
    intro: "Open Integrations → Website Elements, start from a template and change as much or as little as you like.",
    steps: [
      { icon: LayoutTemplate, title: "Pick a template", text: "Carousels, grids, badges, stickers, a list or a review wall.", sample: "Review Wall" },
      { icon: Filter, title: "Choose the reviews", text: "Set the source, a minimum star rating, the order and words to leave out.", sample: "4★ and up · newest" },
      { icon: Palette, title: "Match your brand", text: "Pick a theme, then change the accent, star and text colors, corners and font.", sample: "Theme: Soft tint" },
      { icon: Code2, title: "Copy the code", text: "One script tag, or an iframe for sites that block scripts.", sample: "Copy installation code" },
      { icon: Globe, title: "Paste it on your site", text: "Drop it into a Custom HTML block. It adjusts to mobile and desktop.", sample: "Live on shinehairstudio.com" },
    ],
  },
  rows: [
    {
      eyebrow: "Always current",
      title: "Today’s happy client is tomorrow’s proof",
      text: "Widgets read the reviews already synced into Zyene. When a new review comes in, it shows on your site the next time the page loads. No re-uploading, no screenshots.",
      points: [
        "Show Google reviews only, or every synced source",
        "Up to 100 reviews per widget",
        "Include the owner reply, review photos and dates if you like",
      ],
      media: {
        kind: "photo",
        src: "/images/industries/salons-candid-v2.webp",
        alt: "A hairstylist combing a smiling client’s gray hair in a bright salon",
        objectPosition: "center 25%",
        overlay: (
          <>
            <OverlayCard icon={Star} title="New 5-star Google review" text="Synced to Shine Hair Studio in Zyene" tone="dark" />
            <OverlayCard icon={RefreshCw} title="Now on your website" text="Shown in your Review Wall on the next page load" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "20 templates",
      title: "Start from a layout that fits your page",
      text: "A carousel for the home page, a sidebar widget for blog posts, a floating badge for every page. Each template is a starting point you can restyle.",
      points: [
        "Carousels, grids, sliders, a list and a review wall",
        "Badges and stickers, fixed or floating in a corner",
        "AI summary layouts that sum up what people say",
      ],
      media: { kind: "visual", node: <ReviewWidgetsGalleryVisual />, label: "Gallery of the 20 widget templates in the builder" },
    },
    {
      eyebrow: "The builder",
      title: "Change what it shows and how it looks",
      text: "Eight tabs cover every detail, from which reviews appear to the color of the stars. The preview updates as you go, and the install code is ready when you are.",
      points: [
        "Filter by minimum rating, text-only reviews and excluded words",
        "Six themes plus custom background, text, outline and star colors",
        "Arrows, pagination, auto slide, rows on mobile and right-to-left text",
      ],
      media: { kind: "visual", node: <ReviewWidgetsBuilderVisual />, label: "Widget builder with content filters, theme choices and the install snippet" },
    },
  ],
  facts: [
    { value: "20", label: "Ready-made widget templates" },
    { value: "6", label: "Themes to start from" },
    { value: "100", label: "Reviews a widget can show" },
    { value: "2", label: "Ways to embed: script tag or iframe" },
  ],
  capabilities: {
    title: "Small details that make a widget feel like yours",
    items: [
      { icon: Sparkles, title: "AI review summary", text: "Add a card that sums up what reviewers say, generated from your reviews." },
      { icon: BadgeCheck, title: "Badges & stickers", text: "Show your rating with an “Excellent” or Google rating label, fixed or floating." },
      { icon: Filter, title: "Review filters", text: "Minimum stars, text-only reviews, sort order and words or names to hide." },
      { icon: Palette, title: "Full color control", text: "Accent, stars, background, cards, text and outlines, plus corner radius." },
      { icon: MousePointerClick, title: "Click actions", text: "Open a review in a popup, send people to Google, or do nothing." },
      { icon: Star, title: "Write a review button", text: "Invite site visitors to leave their own review from the widget header." },
    ],
  },
  note: "Widgets are available on paid plans, including trials. They show reviews synced into Zyene, so a new review appears after your next sync. Design changes need the new code pasted in place of the old. The iframe version uses a fixed height and cannot float.",
  faqs: [
    { question: "How do I add Google reviews to my website?", answer: "In Zyene, open Integrations → Website Elements, pick a template, adjust it, and copy the installation code. Paste it into a Custom HTML block on your website. If your site blocks scripts, use the iframe version instead." },
    { question: "Does the widget update when I get new reviews?", answer: "Yes. The widget loads your synced reviews each time the page opens, so new reviews appear without touching your site. If you change the design, copy the new code and replace the old one." },
    { question: "Can I choose which reviews appear?", answer: "Yes. Choose Google only or all synced sources, set a minimum star rating from 1 to 5, sort by newest, highest or oldest, show only reviews with text, and hide reviews containing words or names you list." },
    { question: "Does it work on any website builder?", answer: "It works anywhere you can add custom HTML. The script version adjusts to mobile and desktop. The iframe version is for platforms that block scripts and uses a fixed height." },
    { question: "Can I remove Zyene branding from the widget?", answer: "Yes. The Hide Branding setting in Settings → Public Profile → Branding hides the Zyene footer on your review page and your widgets." },
    { question: "Which plans include review widgets?", answer: "Widgets are included on Starter, Professional and Enterprise while your subscription is active or in its trial." },
  ],
  related: ["review-monitoring", "review-page", "local-seo"],
};
