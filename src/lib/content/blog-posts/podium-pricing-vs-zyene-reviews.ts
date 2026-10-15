import type { BlogPostSource } from "@/lib/content/blog-types";
import { VENDOR_COMPARISON_TABLE, VENDOR_QUOTE_CHECKLIST, VENDOR_SOURCE_LINKS } from "@/lib/content/vendor-comparison-content";

export const podiumPricingVsZyeneReviewsPost: BlogPostSource = {
  slug: "podium-pricing-vs-zyene-reviews",
  title: "Podium Pricing vs Zyene Reviews (2026): Compare the Scope",
  excerpt: "Compare your written Podium offer with Zyene's published review-management plans, request allowances and billing terms.",
  pillar: "competitor-analysis", pillarLabel: "Competitor Analysis",
  publishedAt: "2026-09-21", dateModified: "2026-10-11",
  author: { name: "Zyene Reviews Team", role: "Editorial" },
  metaTitle: "Podium Pricing vs Zyene Reviews (2026 Guide)",
  metaDescription: "Podium pricing is sales-led. Compare your quote, message allowances and contract terms with Zyene's published review-management plans.",
  keywords: ["podium pricing", "podium vs zyene reviews", "podium cost per month", "podium alternatives"],
  relatedSlugs: ["birdeye-pricing-breakdown-2026", "birdeye-alternatives-for-local-businesses"],
  internalLinks: [
    { label: "Zyene Reviews vs Podium", href: "/compare/podium" },
    { label: "Zyene pricing and trial terms", href: "/pricing" },
    { label: "Review collection workflows", href: "/features/review-collection" },
    { label: "AI drafts and automatic Google replies", href: "/features/ai-replies" },
  ],
  faqs: [
    { question: "What does Podium cost monthly?", answer: "Podium's current pricing page directs buyers to sales for plan details. Obtain a written quote instead of budgeting from historical prices reported elsewhere." },
    { question: "Does Podium require an annual contract?", answer: "The public pricing page does not establish your offer's terms. Confirm minimum term, billing frequency, renewal, notice and cancellation conditions in the written agreement." },
  ],
  body: [
    { type: "summary", text: "Podium pricing requires a sales conversation. Zyene publishes review-focused monthly and annual plans. Compare your actual offer with the products, message volume and location count you need; no universal savings figure applies." },
    { type: "h2", text: "What you are buying matters as much as the price" },
    { type: "p", text: "Podium describes reviews alongside an inbox, phones, website chat, payments, automations and AI lead-conversion products. Ask which are included in your offer. A business using several communication workflows may prefer this broader scope." },
    { type: "p", text: "Zyene focuses on connected reviews, requests, AI business replies, customer feedback, competitor ratings and GBP insights. Starter includes 500 SMS and 500 email review requests per month for one location. Those requests are different from a general-purpose phone or two-way sales messaging plan." },
    VENDOR_COMPARISON_TABLE,
    ...VENDOR_QUOTE_CHECKLIST,
    { type: "h2", text: "Questions for a communication-heavy business" },
    { type: "ul", items: [
      "Can the offer support your phone numbers, CRM and lead sources?",
      "Are AI review replies, an AI phone agent and sales automation separate products?",
      "How are bulk messages, carrier fees and sender registration charged?",
      "What can you export, and what happens to phone workflows if you leave?",
    ] },
    ...VENDOR_SOURCE_LINKS,
    { type: "cta", ctaLabel: "Compare Zyene Reviews and Podium", ctaHref: "/compare/podium" },
  ],
};
