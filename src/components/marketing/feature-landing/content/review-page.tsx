import {
  BellRing, Copy, Link2, Palette, PenLine, ScanLine, ShieldCheck, Smartphone, Star, Tags, ThumbsUp, UserRound,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  ReviewPageHeroVisual, ReviewPagePrivateVisual, ReviewPageSettingsVisual,
} from "@/components/marketing/feature-landing/visuals/review-page-visuals";

export const REVIEW_PAGE_CONTENT: FeatureLandingContent = {
  slug: "review-page",
  hero: {
    eyebrow: "Review page & AI drafts",
    headline: "Your customers know what they loved. We help them say it.",
    lede: "A branded review page that asks how the visit went, lets customers tap what stood out, and turns their choices into a short review they can edit, copy and post on Google.",
    visual: <ReviewPageHeroVisual />,
    visualLabel: "Example review page showing tag selection and an AI-drafted review",
  },
  flow: {
    eyebrow: "How it works",
    title: "From a scan to a Google review in five taps",
    intro: "Every QR code, NFC stand, text and email you send opens the same page. Here is what your customer sees.",
    steps: [
      { icon: ScanLine, title: "Open the page", text: "Scan the QR code, tap an NFC stand or open the link in a text or email.", sample: "collectratings.com/corner-cafe" },
      { icon: Star, title: "Rate the visit", text: "Answer your question in the rating style you picked.", sample: "★★★★★" },
      { icon: Tags, title: "Pick what stood out", text: "Tap the tags you set up and, if you like, the team member who helped.", sample: "Friendly staff · Maya" },
      { icon: PenLine, title: "Get a draft", text: "AI writes a short review from those choices. Every word can be changed.", sample: "Drafted in seconds" },
      { icon: Copy, title: "Copy & post", text: "One tap copies the text and opens your Google review form.", sample: "Copy & go to Google" },
    ],
    branch: {
      label: "After the rating, the page follows your threshold",
      paths: [
        { icon: ThumbsUp, tone: "positive", title: "At or above your threshold", text: "Tags, the AI draft and a one-tap hand-off to your Google review form." },
        { icon: ShieldCheck, tone: "caution", title: "Below your threshold", text: "A private feedback form, an optional offer, and an alert to your team." },
      ],
    },
  },
  rows: [
    {
      eyebrow: "In the moment",
      title: "Ask while the coffee is still warm",
      text: "Most happy customers never write a review because finding the right words takes effort. The page removes that effort: a few taps, and the draft is ready.",
      points: ["No app or account for your customer", "Works on any phone browser", "The same page behind every QR code, NFC stand, text and email"],
      media: {
        kind: "photo",
        src: "/marketing/home/cafe-service.webp",
        alt: "A barista handing a customer an iced coffee across the counter",
        overlay: (
          <>
            <OverlayCard icon={Smartphone} title="QR code scanned" text="Corner Café review page opened" tone="dark" />
            <OverlayCard icon={Star} title="5 stars · Friendly staff, Great coffee" text="Draft copied, opening Google" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "Make it yours",
      title: "Customize every step from Settings",
      text: "Choose the question, the rating style, the tags, your staff names, the success message, your logo and colors. Each location gets its own page and link.",
      points: ["Rating, Tags, Review Site, Feedback, Success and Branding tabs", "Stars, emoji, numbers, slider or radio buttons", "Set your private feedback threshold from 1 to 5 stars"],
      media: { kind: "visual", node: <ReviewPageSettingsVisual />, label: "Settings screen for customizing the review page" },
    },
    {
      eyebrow: "Service recovery",
      title: "Hear about a bad day before it goes public",
      text: "When a rating falls below your threshold, the customer sees a private form instead of the draft step. Your team gets the message and can make it right.",
      points: ["Ask for email or phone as hidden, optional or required", "Show an optional apology offer", "Private feedback lands in its own tab in Reviews"],
      media: { kind: "visual", node: <ReviewPagePrivateVisual />, label: "Private feedback form shown after a low rating" },
    },
  ],
  facts: [
    { value: "5", label: "Rating styles to choose from" },
    { value: "6", label: "Settings tabs to customize the page" },
    { value: "1 tap", label: "To copy the draft and open Google" },
    { value: "0", label: "Reviews posted on a customer’s behalf" },
  ],
  capabilities: {
    title: "Everything on the page is yours to set",
    items: [
      { icon: Palette, title: "Branding", text: "Logo, colors and your own words, with an option to hide Zyene branding." },
      { icon: Tags, title: "Custom tags", text: "Add, remove and order the things customers can say they liked." },
      { icon: UserRound, title: "Staff shout-outs", text: "Let customers name the person who helped them." },
      { icon: PenLine, title: "Editable AI draft", text: "Built only from the customer’s rating and choices, and fully editable." },
      { icon: BellRing, title: "Team alerts", text: "Private feedback alerts your team, and customers who leave an email get a recovery message." },
      { icon: Link2, title: "Your review site", text: "Point the hand-off at your Google review form for each location." },
    ],
  },
  note: "AI drafts are available on paid plans and trials, within your plan’s monthly allowance (1,500 on Starter, 2,000 on Professional). Customers decide whether to post; Zyene cannot confirm that Google published a review. Check your workflow against Google’s review policies.",
  faqs: [
    { question: "Does Zyene post reviews for my customers?", answer: "No. The page drafts a review from the customer’s own rating and choices. They can edit it, and one tap copies it and opens your Google review form. Posting is always their decision." },
    { question: "Can I change the tags and the question?", answer: "Yes. In Settings → Public Profile you choose the question, the rating style, the tags, staff names, the success message, your logo and colors." },
    { question: "What happens with a low rating?", answer: "Ratings below the threshold you set see a private feedback form instead. You can ask for contact details and show an optional offer, and your team is alerted so you can follow up." },
    { question: "Do customers need an app or an account?", answer: "No. The page opens in any phone browser from a QR code, an NFC stand, a text or an email." },
    { question: "Is there a limit on AI drafts?", answer: "Starter includes 1,500 AI customer review drafts a month and Professional includes 2,000. Business replies to reviews are counted separately." },
  ],
  related: ["qr-code-reviews", "nfc-review-stands", "review-requests"],
};
