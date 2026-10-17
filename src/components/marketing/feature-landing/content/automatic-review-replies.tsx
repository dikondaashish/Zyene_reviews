import {
  BadgeCheck, Building2, CircleCheck, Inbox, MessageSquareText, Power, Send, ShieldCheck, SlidersHorizontal, Sparkles, Star,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  AutoRepliesConfirmVisual, AutoRepliesEligibilityVisual, AutoRepliesHeroVisual,
} from "@/components/marketing/feature-landing/visuals/automatic-review-replies-visuals";

export const AUTOMATIC_REVIEW_REPLIES_CONTENT: FeatureLandingContent = {
  slug: "automatic-review-replies",
  hero: {
    kicker: "Automatic Google replies",
    headline: "Replies that post themselves, even on busy days.",
    lede: "Choose which star ratings to answer and the tone. Zyene writes and posts the reply. The rest wait in your inbox.",
    visual: <AutoRepliesHeroVisual />,
    visualLabel: "Example of a new 5-star Google review passing the automatic reply checks and getting a posted reply",
  },
  flow: {
    title: "Set it once, and new reviews are answered",
    intro: "You pick the rule. Zyene checks every new Google review against it.",
    steps: [
      { icon: SlidersHorizontal, title: "Choose your rule", text: "3 stars and up, 4 stars and up, or 5 stars only, plus a tone.", sample: "4 stars and up · Friendly" },
      { icon: Power, title: "Turn it on", text: "Confirm in a short dialog. You won’t approve each reply before it posts.", sample: "Enable automatic publishing" },
      { icon: Star, title: "A new review arrives", text: "A Google review posted after you turned it on, with no reply yet.", sample: "★★★★★ · Tom H." },
      { icon: Sparkles, title: "Zyene writes the reply", text: "In your tone, using the rating and what the customer wrote.", sample: "Friendly tone" },
      { icon: Send, title: "It posts to Google", text: "The review moves to Responded with an auto reply badge.", sample: "AI auto commenter" },
    ],
    branch: {
      label: "Every new review is checked against your rule",
      paths: [
        { icon: CircleCheck, tone: "positive", title: "Meets your rule", text: "A new, unanswered Google review at or above your minimum gets an automatic reply." },
        { icon: Inbox, tone: "caution", title: "Doesn’t meet it", text: "Lower ratings, older or already-answered reviews, and Facebook or Yelp reviews wait for you." },
      ],
    },
  },
  rows: [
    {
      eyebrow: "Hands busy",
      title: "Keep replying while you’re under the hood",
      text: "Most owners don’t have time to thank every happy customer the day the review lands. Automatic replies take care of the reviews you choose, so they don’t sit unanswered while you work.",
      points: [
        "Replies to new Google reviews at or above your minimum rating",
        "Uses the same AI drafting as reply suggestions, in your chosen tone",
        "Each automatic reply is labeled in your inbox, so you can find and edit it",
      ],
      media: {
        kind: "photo",
        src: "/images/industries/auto-repair-candid-v2.webp",
        alt: "A mechanic working on a car engine in a busy repair shop",
        objectPosition: "center 30%",
        overlay: (
          <>
            <OverlayCard icon={Star} tone="dark" title="New 5★ review on Google" text="Northside Auto · “Fixed my brakes the same day…”" />
            <OverlayCard icon={CircleCheck} tone="positive" title="Reply posted automatically" text="Friendly tone · nothing for you to do" />
          </>
        ),
      },
    },
    {
      eyebrow: "No surprises",
      title: "You see exactly what you’re turning on",
      text: "Before anything goes live, a confirmation shows your rating rule, your tone and an example reply. It says plainly that replies will post without your review.",
      points: [
        "Applies only to the business selected in the header",
        "Existing reviews are not included",
        "Keep off is one click, and so is turning it off later",
      ],
      media: { kind: "visual", node: <AutoRepliesConfirmVisual />, label: "Confirmation dialog for turning on automatic Google replies" },
    },
    {
      eyebrow: "Who gets a reply",
      title: "Low ratings still come to you",
      text: "Automatic replies only answer the reviews that meet your rule. The rest stay in your inbox, so an unhappy customer always gets a personal reply from you.",
      points: [
        "The lowest setting is 3 stars, so 1 and 2 star reviews always wait for you",
        "Reviews already answered on Google are skipped",
        "Facebook and Yelp reviews are never auto-replied",
      ],
      media: { kind: "visual", node: <AutoRepliesEligibilityVisual />, label: "List of new reviews showing which got an automatic reply under a 4 stars and up rule" },
    },
  ],
  facts: [
    { value: "3", label: "Rating rules: 3+, 4+ or 5 stars only" },
    { value: "3", label: "Tones: Professional, Friendly, Concise" },
    { value: "0", label: "Existing reviews answered when you switch it on" },
    { value: "14 days", label: "Oldest review an automatic reply will ever post to" },
  ],
  capabilities: {
    title: "How automatic replies behave",
    items: [
      { icon: Star, title: "Rating rule", text: "3 stars and up, 4 stars and up, or 5 stars only." },
      { icon: MessageSquareText, title: "Your tone", text: "Professional, Friendly or Concise, the same tones as reply suggestions." },
      { icon: ShieldCheck, title: "New reviews only", text: "Only reviews posted after you turn it on, with no reply yet." },
      { icon: BadgeCheck, title: "Labeled in your inbox", text: "Automatic replies carry an AI auto commenter badge on the review." },
      { icon: Power, title: "Off in one switch", text: "Stops future replies. Replies already being written may still finish." },
      { icon: Building2, title: "Set per business", text: "Each location has its own switch, rating rule and tone." },
    ],
  },
  demoTab: "reviews",
  note: "Automatic replies need a connected Google Business Profile and a paid plan or active trial. Replies post publicly without individual approval. If you turn it off, replies already being processed may still post. Facebook and Yelp reviews are not auto-replied.",
  faqs: [
    { question: "Can Zyene reply to Google reviews automatically?", answer: "Yes. Turn on automatic replies on the Reviews page, choose 3 stars and up, 4 stars and up, or 5 stars only, and pick a Professional, Friendly or Concise tone. New Google reviews that meet the rule get an AI-written reply posted to your profile." },
    { question: "Will it reply to my old reviews?", answer: "No. It only answers reviews posted after you turn it on (with a few minutes of allowance), and it never posts to a review more than 14 days old. To answer older reviews, use AI reply suggestions in the inbox." },
    { question: "Can I approve replies before they go live?", answer: "Not with automatic replies; they post without approval, and the confirmation dialog says so. If you want to check every reply, leave this off and use AI reply suggestions, where nothing posts until you click Post Reply." },
    { question: "Does it reply to negative reviews?", answer: "Only if they meet your minimum. The lowest setting is 3 stars, so 1 and 2 star reviews are always left for you to answer personally." },
    { question: "How do I turn automatic replies off?", answer: "Open Automatic replies on the Reviews page and switch it off. That stops future replies straight away; a reply that was already being written may still post." },
    { question: "Is there a monthly limit on automatic replies?", answer: "No. Automatic replies are included on paid plans and trials with no monthly quota, and they don’t use your allowance of AI customer review drafts." },
  ],
  related: ["ai-replies", "review-monitoring", "review-requests"],
};
