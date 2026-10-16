import {
  BellRing, Code2, Inbox, Link2, Mail, Megaphone, MousePointerClick, Nfc, QrCode, ShieldCheck, Star, ThumbsUp, Users,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  ReviewCollectionChannelsVisual, ReviewCollectionHeroVisual, ReviewCollectionTriggersVisual,
} from "@/components/marketing/feature-landing/visuals/review-collection-visuals";

export const REVIEW_COLLECTION_CONTENT: FeatureLandingContent = {
  slug: "review-collection",
  hero: {
    eyebrow: "Review collection & Negative Feedback Shield",
    headline: "Ask every customer. Hear the unhappy ones first.",
    lede: "QR codes, NFC stands, texts, emails and automatic triggers all open one branded review page. Happy customers get help writing a Google review. Lower ratings come to you privately, so you can fix the problem.",
    visual: <ReviewCollectionHeroVisual />,
    visualLabel: "Example requests screen with recent activity and a private feedback alert",
  },
  flow: {
    eyebrow: "How it works",
    title: "Every request ends on the same page",
    intro: "It does not matter how you ask. The customer always lands on your review page for that location.",
    steps: [
      { icon: MousePointerClick, title: "Pick how to ask", text: "A QR code or NFC stand in person, a text or email after the visit, or an automatic trigger.", sample: "QR · NFC · SMS · Email" },
      { icon: Link2, title: "Open your page", text: "Your logo, colors and question, in any phone browser.", sample: "collectratings.com/corner-cafe" },
      { icon: Star, title: "Rate the visit", text: "The rating decides what the customer sees next.", sample: "★★★★☆" },
      { icon: Inbox, title: "Follow up in one place", text: "Google reviews sync to your inbox. Private feedback gets its own tab.", sample: "Reviews · Private feedback" },
    ],
    branch: {
      label: "After the rating, the page follows your threshold (4 stars by default)",
      paths: [
        { icon: ThumbsUp, tone: "positive", title: "At or above your threshold", text: "Tags, an editable AI draft, then one tap to copy it and open your Google review form." },
        { icon: ShieldCheck, tone: "caution", title: "Below your threshold", text: "A private feedback form. Your team is alerted, and customers who leave an email get an apology from you." },
      ],
    },
  },
  rows: [
    {
      eyebrow: "Every way to ask",
      title: "Many ways in, one page behind them",
      text: "Put a QR code on the table, an NFC stand by the register, or send a text after the appointment. Each one opens the same review page, so customers get the same experience every time.",
      points: [
        "Review QR codes and NFC review stands for in-person visits",
        "SMS and email requests, one at a time or as a campaign with day-7 and day-14 reminders",
        "A customer list that shows who you have asked and who has reviewed",
      ],
      media: { kind: "visual", node: <ReviewCollectionChannelsVisual />, label: "Six ways to ask, all leading to one review link that splits by rating" },
    },
    {
      eyebrow: "Negative Feedback Shield",
      title: "A private path when the visit went wrong",
      text: "When a rating falls below your threshold, the customer sees a feedback form instead of the Google step. Your team hears about it right away and can make it right.",
      points: [
        "Threshold of 4 stars by default, adjustable from 1 to 5",
        "Ask for email or phone, and show an optional apology offer",
        "Feedback lands in the Private feedback tab in Reviews",
      ],
      media: {
        kind: "photo",
        src: "/marketing/home/cafe-owner-feedback-candid-v2.webp",
        alt: "A café owner in an apron reading something on a tablet behind the counter",
        overlay: (
          <>
            <OverlayCard icon={BellRing} title="New private feedback · 2 stars" text="“My order came out cold.” · Corner Café" tone="caution" />
            <OverlayCard icon={Mail} title="Apology email sent" text="The customer left an email address" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "Ask automatically",
      title: "Let your systems send the request",
      text: "Connect Square to send a request after a payment, post to a webhook from Zapier or your own scripts, or call the REST API with your key.",
      points: [
        "Square: requests after payments with a customer contact (early access)",
        "Generic webhook that works with “Webhooks by Zapier”",
        "REST API: POST /api/v1/requests/send with an X-API-Key header",
      ],
      media: { kind: "visual", node: <ReviewCollectionTriggersVisual />, label: "Example API request and connected triggers" },
    },
  ],
  facts: [
    { value: "4★", label: "Default private feedback threshold, adjustable from 1 to 5" },
    { value: "3", label: "Automatic triggers: Square, webhooks and the REST API" },
    { value: "2", label: "Optional campaign reminders, on day 7 and day 14" },
    { value: "500 + 500", label: "SMS and email requests a month on Starter" },
  ],
  capabilities: {
    title: "Everything you need to ask, and to listen",
    items: [
      { icon: QrCode, title: "QR codes", text: "One code and short link per location, ready to print or download." },
      { icon: Nfc, title: "NFC review stands", text: "Order stands in the app, already linked to your review page." },
      { icon: Mail, title: "SMS & email", text: "Send by text, email or both, now or scheduled for later." },
      { icon: Megaphone, title: "Campaigns", text: "Ask a list at once, with optional reminders on day 7 and 14." },
      { icon: Users, title: "Customer list", text: "Names, contacts, tags and a timeline of every request." },
      { icon: Code2, title: "POS, webhook & API", text: "Trigger requests from Square, Zapier-style webhooks or your own code." },
    ],
  },
  note: "The review page, QR codes and NFC stands need a paid plan or trial and a Google review destination for the location. Square is in early access. Below the threshold, the private form still shows a “Go to Google” link, so customers can always post publicly. Use the shield to fix problems, not to hide honest reviews.",
  faqs: [
    { question: "What is a Negative Feedback Shield?", answer: "It is the private path on your review page. Customers who rate below your threshold (4 stars by default) see a feedback form instead of the Google step. Your team is alerted, and if they leave an email they get an apology email from you." },
    { question: "Does Zyene hide or block negative Google reviews?", answer: "No. The private form keeps a “Go to Google” link, so any customer can still post publicly. Zyene never posts or removes reviews for you." },
    { question: "What is the best way to ask customers for Google reviews?", answer: "Ask soon after the visit and make it easy. Use a QR code or NFC stand while the customer is still there, and a text or email for visits that end later. With Zyene, every option opens the same short review page." },
    { question: "Can review requests go out automatically?", answer: "Yes. Square can send a request after a payment (early access), a generic webhook works with “Webhooks by Zapier”, and the REST API sends a request when you call POST /api/v1/requests/send with your API key." },
    { question: "How many review requests can I send?", answer: "Starter includes 500 SMS, 500 email and 1,500 link requests a month for one location. Professional includes 700 SMS, 700 email and 2,000 link requests per location, for up to three locations. Enterprise is unlimited." },
  ],
  related: ["review-page", "review-requests", "review-campaigns"],
};
