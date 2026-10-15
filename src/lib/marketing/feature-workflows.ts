import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";

type FeatureWorkflow = {
  title: string;
  steps: string[];
  limits: string;
  links: { label: string; href: string }[];
};

export const FEATURE_WORKFLOWS: Partial<Record<FeaturePillarSlug, FeatureWorkflow>> = {
  "ai-replies": {
    title: "Choose reviewed drafts or automatic Google replies",
    steps: [
      "Connect the Google Business Profile for the selected location and sync its reviews.",
      "Generate a business reply draft, check the facts and tone, edit it and publish to Google.",
      "For automatic mode, choose Professional, Friendly or Concise and a minimum star rating in business settings.",
      "Eligible new, unanswered Google reviews are processed in the background. Turn automatic mode off when human review is needed.",
    ],
    limits: "Direct publishing and automatic replies currently support Google. Other platforms may require posting in their own interface. Automatic mode is not a bulk backfill: reviews must meet the enabled-time cutoff and age checks. It publishes publicly without individual approval; jobs already processing may finish after it is disabled. An active eligible subscription or trial is required. Business replies have no monthly quota; AI customer review drafts have a separate allowance.",
    links: [
      { label: "Try the review response generator", href: "/tools/review-response-generator" },
      { label: "Reply templates for difficult reviews", href: "/resources/negative-review-templates" },
      { label: "Plan allowances and trial terms", href: "/pricing" },
    ],
  },
  "review-collection": {
    title: "Set up a request your customer can recognize",
    steps: [
      "Configure your branded review page, public destination and rating threshold for the active location.",
      "Add customer contacts manually or through CSV import; check consent, contact details and opt-outs.",
      "Choose email or SMS, edit the message, and send or schedule the campaign. Shareable links and QR codes are also available.",
      "Inspect request delivery and engagement, review private feedback and assign the team a follow-up.",
    ],
    limits: "Starter includes 500 SMS and 500 email requests per month for one location; Professional includes 700 of each per location for up to three locations. Channel setup, provider delivery and consent requirements apply. The current branded flow sends ratings below the configured threshold to private feedback and ratings at or above it toward a public review. A recorded handoff does not confirm that Google published a review. Check your intended workflow against the review platform's policies.",
    links: [
      { label: "SMS and email request templates", href: "/resources/review-request-templates" },
      { label: "Create a direct Google review link", href: "/tools/review-link-generator" },
      { label: "Request setup and API documentation", href: "/docs/quickstart" },
    ],
  },
  "competitor-tracking": {
    title: "Compare ratings and review activity over time",
    steps: [
      "An owner or admin adds a competitor with the correct Google profile for the active business.",
      "Refresh the tracked data and check the capture date and provider status.",
      "Compare average rating, total reviews and changes between available snapshots.",
      "Configure rating-change and review-spike alerts, then use exports and market briefs to discuss observed changes.",
    ],
    limits: "Competitor tracking is included in paid plans. Refreshes depend on provider access and successful watch runs; it is not a continuous live feed. When live data is unavailable, saved values may remain visible. A snapshot shows review metrics, not a measured Google search position or a competitor's conversion rate. Sparse history limits comparisons. Confirm the last successful capture before acting.",
    links: [
      { label: "Use the local SEO checklist", href: "/resources/local-seo-checklist" },
      { label: "Google Business Profile insights", href: "/features/local-seo" },
      { label: "Compare review-management plans", href: "/pricing" },
    ],
  },
  "local-seo": {
    title: "Use profile evidence to choose your next improvement",
    steps: [
      "Connect a Google Business Profile you are authorized to manage and select the location.",
      "Review available Search and Maps performance, search-keyword impressions and the profile audit.",
      "Inspect each recommendation and its source. Prepare a business-description or profile-content draft for human review.",
      "Make accurate changes, then compare enquiries and performance over a meaningful period.",
    ],
    limits: "Available metrics depend on Google access, reporting thresholds and sync freshness. Keyword impressions are not keyword rankings. Audit scores and estimates are not guaranteed Google positions or measured AI citations. This page describes the profile insights and audit workspace; confirm any separate listing-management action before buying for that purpose.",
    links: [
      { label: "Work through the local SEO checklist", href: "/resources/local-seo-checklist" },
      { label: "HVAC and home-services reputation guide", href: "/blog/hvac-home-services-reputation-management" },
      { label: "Track competitor review metrics", href: "/features/competitor-tracking" },
    ],
  },
};
