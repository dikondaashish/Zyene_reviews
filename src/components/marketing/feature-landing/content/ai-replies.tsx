import {
  CircleCheck, Inbox, MessagesSquare, PenLine, RefreshCw, Send, SlidersHorizontal, Sparkles, Store,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  AiRepliesAttentionVisual, AiRepliesHeroVisual, AiRepliesQaVisual,
} from "@/components/marketing/feature-landing/visuals/ai-replies-visuals";

export const AI_REPLIES_CONTENT: FeatureLandingContent = {
  slug: "ai-replies",
  hero: {
    kicker: "AI review replies",
    headline: "A thoughtful reply to every review.",
    lede: "AI drafts a reply from the rating and what the customer wrote. Pick a tone, edit any word, then post it to Google.",
    visual: <AiRepliesHeroVisual />,
    visualLabel: "Example 4-star review with a Friendly AI draft on top of Professional and Concise versions",
  },
  flow: {
    title: "From review to posted reply in five steps",
    intro: "AI does the first draft. You decide what goes on Google.",
    steps: [
      { icon: Inbox, title: "Open a review", text: "From the Reviews inbox, or the Needs your attention list on your dashboard.", sample: "4★ · Priya S." },
      { icon: Sparkles, title: "Click AI suggest", text: "A draft written for this review appears in the reply box.", sample: "AI suggest" },
      { icon: SlidersHorizontal, title: "Pick a tone", text: "Switch between the three tones. Each draft is kept while you compare.", sample: "Professional · Friendly · Concise" },
      { icon: PenLine, title: "Make it yours", text: "Edit anything you like. Nothing is posted until you click Post Reply.", sample: "Edit reply" },
      { icon: Send, title: "Post to Google", text: "The reply goes live on your Business Profile and the review moves to Responded.", sample: "Posted to Google" },
    ],
  },
  rows: [
    {
      eyebrow: "Edit, then post",
      title: "You stay in charge of every word",
      text: "An AI suggestion is a starting point. Read it, add the detail only you know, and post it when it sounds right. If something changes later, you can edit or delete the reply from the review card.",
      points: [
        "Drafts use the star rating, the review text and your business details",
        "4 and 5 star reviews with little or no text get a varied thank-you, not the same line every time",
        "Edit or delete a posted Google reply later",
      ],
      media: {
        kind: "photo",
        src: "/marketing/home/cafe-owner-feedback-candid-v2.webp",
        alt: "A café owner in an apron reading a tablet beside the espresso machine",
        objectPosition: "center 35%",
        overlay: (
          <>
            <OverlayCard icon={Sparkles} title="Friendly draft ready" text="“Thanks so much, Priya! Maya will be thrilled…”" />
            <OverlayCard icon={CircleCheck} tone="positive" title="Reply posted to Google" text="Review moved to Responded" />
          </>
        ),
      },
    },
    {
      eyebrow: "From your dashboard",
      title: "Urgent reviews come with a draft button",
      text: "The Needs your attention list on your dashboard shows unanswered reviews with 1 or 2 stars, or a high urgency score. Draft a response with AI, regenerate it or adjust the tone, and send it without opening the inbox.",
      points: [
        "An urgency score on each review",
        "Regenerate, or adjust the tone in place",
        "Send reply posts straight to Google",
      ],
      media: { kind: "visual", node: <AiRepliesAttentionVisual />, label: "Dashboard list of urgent reviews with an AI-drafted owner reply and a Send reply button" },
    },
    {
      eyebrow: "Google Q&A",
      title: "Answer questions on your Google listing too",
      text: "When Google provides Q&A for your location, the Q&A page lists the questions people have asked. Suggest an answer with AI, check it, and post it to Google.",
      points: [
        "See which questions still need an answer",
        "Suggest with AI, then Post to Google",
        "The page stays hidden when Google has no Q&A for your listing",
      ],
      media: { kind: "visual", node: <AiRepliesQaVisual />, label: "Google Q&A list with an answer dialog showing Suggest with AI and Post to Google" },
    },
  ],
  facts: [
    { value: "3", label: "Reply tones: Professional, Friendly, Concise" },
    { value: "0", label: "Replies posted before you click Post" },
    { value: "$29.99", label: "Starter plan per month, AI replies included" },
    { value: "7 days", label: "Free trial with AI replies included" },
  ],
  capabilities: {
    title: "Built into the reply box",
    items: [
      { icon: Sparkles, title: "One-click suggestion", text: "AI suggest fills the reply box with a draft for that review." },
      { icon: SlidersHorizontal, title: "Three tones", text: "Professional, Friendly or Concise. Switch to compare before you choose." },
      { icon: Store, title: "Your business details", text: "Drafts use your business name and category, so the reply fits what you do." },
      { icon: PenLine, title: "Full editing", text: "Change, shorten or rewrite the draft before it goes anywhere." },
      { icon: RefreshCw, title: "Update later", text: "Edit or delete a reply you already posted to Google." },
      { icon: MessagesSquare, title: "Google Q&A", text: "AI-suggested answers to questions on your listing, where Google offers Q&A." },
    ],
  },
  demoTab: "reviews",
  note: "AI reply suggestions need a paid plan or an active trial. Replies post to Google only; for Facebook and Yelp reviews, reply on those sites. Business replies don’t use your monthly allowance of AI customer review drafts, but a fair-use limit of 100 AI drafts per business per day applies.",
  faqs: [
    { question: "How does the AI write a reply?", answer: "It reads the star rating, the review text, and your business name and category, then writes a draft in the tone you pick. For short 4 and 5 star reviews with little or no text, it picks from a rotating set of thank-you messages so your replies don’t all read the same." },
    { question: "Will Zyene post AI replies without me?", answer: "Not with AI suggestions. A draft only goes to Google when you click Post Reply. If you want new Google reviews answered for you, turn on automatic replies, which post without approval for the star ratings you choose." },
    { question: "Can I use AI replies for Facebook and Yelp reviews?", answer: "Not from Zyene. Replies you post from Zyene go to Google. Facebook and Yelp reviews appear in your inbox for monitoring, and you reply to them on those sites." },
    { question: "Is there a limit on AI replies?", answer: "AI replies to your reviews are included on paid plans and trials, with no monthly quota. They are counted separately from AI customer review drafts, which have a monthly allowance. A fair-use limit of 100 AI drafts per business per day applies." },
    { question: "Which tones can I choose?", answer: "Professional, Friendly and Concise. Professional is polished and courteous, Friendly is warm and conversational, and Concise keeps it to two or three sentences." },
    { question: "Is there a free review response generator?", answer: "Yes. Our free tool at zyenereviews.com/tools/review-response-generator drafts a reply to any review you paste in. Inside Zyene, drafts also use your business details and post to Google in one click." },
  ],
  related: ["automatic-review-replies", "review-monitoring", "smart-insights"],
};
