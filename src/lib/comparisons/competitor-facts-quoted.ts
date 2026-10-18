import { ZYENE_FACTS, type CompetitorFactSheet } from "@/lib/comparisons/competitor-fact-types";

/** Vendors that sell by quote. Read from their own sites on October 17, 2026. */
const CHECKED_ON = "October 17, 2026";

export const BIRDEYE_FACTS: CompetitorFactSheet = {
  name: "Birdeye", price: "Custom quote",
  reportedPrice: "Not published. Third parties report roughly $299 to $449 per location a month",
  pricingNote: "No list price. The pricing page asks for a business email and location count.",
  aiReplies: "AI reply agent; posts on its own or holds for approval",
  competitorTracking: "Competitor benchmarking listed as a product",
  sending: "Not published; set in your quote",
  terms: "One contract across products; term not published", trial: "Not published",
  source: "https://birdeye.com/pricing/",
  bestFor: "Teams buying reviews, listings, surveys, webchat and payments from one vendor under one contract.",
  checkedOn: CHECKED_ON,
  differences: [
    {
      topic: "Published pricing",
      competitor: "No list price. The pricing page is a quote form that asks for your business email and number of locations.",
      zyene: ZYENE_FACTS.published,
      source: { label: "Birdeye pricing", href: "https://birdeye.com/pricing/" },
    },
    {
      topic: "Product scope",
      competitor: "Sold as one platform on one contract, priced by the products you deploy at each location.",
      zyene: "Reviews only: requests, a review inbox, replies, private feedback, competitor tracking and Google Business Profile insights. No listings, webchat or payments.",
      source: { label: "Birdeye pricing", href: "https://birdeye.com/pricing/" },
    },
    {
      topic: "Reply automation",
      competitor: "AI agents request reviews and write replies. Replies can post on their own or wait for approval.",
      zyene: `${ZYENE_FACTS.replies}. Facebook and Yelp reviews are monitored; you reply on those sites.`,
      source: { label: "Birdeye reviews product", href: "https://birdeye.com/reviews/" },
    },
    {
      topic: "Listings",
      competitor: "Listings management with native integrations for Google, Facebook, Apple, Yelp and Bing.",
      zyene: "Does not edit listings. Shows Google Business Profile insights and the search terms people used to find you.",
      source: { label: "Birdeye listings", href: "https://birdeye.com/listings/" },
    },
    {
      topic: "Integrations",
      competitor: "Lists 3,000+ integrations, such as QuickBooks, Square, Xero and Zoho CRM, each tagged Standard, Premium or Enterprise.",
      zyene: ZYENE_FACTS.triggers,
      source: { label: "Birdeye integrations", href: "https://birdeye.com/integration/" },
    },
  ],
};

export const PODIUM_FACTS: CompetitorFactSheet = {
  name: "Podium", price: "Custom quote",
  reportedPrice: "Not published. Third parties report about $399 a month and up",
  pricingNote: "No plan prices published. Podium asks you to talk to sales.",
  aiReplies: "AI Employee is an add-on; review-reply scope not published",
  competitorTracking: "Not listed on the pricing page",
  sending: "Not published",
  terms: "Not published", trial: "Not published",
  source: "https://www.podium.com/pricing",
  bestFor: "Teams that run customer texting, phones and payments in one tool, with reviews as one part of it.",
  checkedOn: CHECKED_ON,
  differences: [
    {
      topic: "Published pricing",
      competitor: "No plan names or prices on the pricing page; it directs you to the sales team.",
      zyene: ZYENE_FACTS.published,
      source: { label: "Podium pricing", href: "https://www.podium.com/pricing" },
    },
    {
      topic: "Product scope",
      competitor: "Inbox, website chat, text marketing, phones and payments, with reviews collected by text.",
      zyene: "Review requests by SMS, email, link and QR code, plus a review inbox. No phone system, webchat or payments.",
      source: { label: "Podium pricing", href: "https://www.podium.com/pricing" },
    },
    {
      topic: "AI",
      competitor: "The AI Employee is listed as an add-on you can attach to any plan.",
      zyene: "AI reply drafts and optional automatic Google replies are included on Starter.",
      source: { label: "Podium pricing", href: "https://www.podium.com/pricing" },
    },
    {
      topic: "Phones and payments",
      competitor: "VoIP phones with missed-call text-back, and payments by text, card reader and tap to pay.",
      zyene: "Not offered. Zyene can send a review request after a Square payment (early access) or from your own webhook.",
      source: { label: "Podium phones", href: "https://www.podium.com/product/phones" },
    },
  ],
};
