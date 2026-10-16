import {
  Bot, Eye, FileCode2, MapPinned, MessageSquarePlus, PieChart, Quote, Swords, ToggleRight, Wallet,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import { AiVisibilityHeroVisual, AiVisibilityShareVisual } from "@/components/marketing/feature-landing/visuals/ai-visibility-visuals";
import { AiVisibilityLibraryVisual } from "@/components/marketing/feature-landing/visuals/ai-visibility-library-visual";

export const AI_VISIBILITY_CONTENT: FeatureLandingContent = {
  slug: "ai-visibility",
  hero: {
    eyebrow: "AI search visibility (AEO)",
    headline: "When customers ask AI where to go, are you in the answer?",
    lede: "Track the questions people ask AI assistants, like “best coffee shop in Kansas City”, and see whether engines such as ChatGPT, Perplexity and Gemini mention you or a competitor.",
    visual: <AiVisibilityHeroVisual />,
    visualLabel: "Example tracked prompt with answers from three AI engines, showing who was mentioned",
  },
  flow: {
    eyebrow: "How it works",
    title: "From a question to a clear picture of who AI recommends",
    intro: "You choose the questions. Zyene asks the engines, reads the answers and keeps score over time.",
    steps: [
      { icon: MessageSquarePlus, title: "Add prompts", text: "Type what a customer would ask, or start from suggested prompts.", sample: "best coffee in Kansas City" },
      { icon: ToggleRight, title: "Switch them on", text: "New prompts start paused. Nothing runs or costs anything until you turn one on.", sample: "Active · Discovery" },
      { icon: Bot, title: "Ask the engines", text: "Run a prompt across the engines available to you, 1, 3 or 5 times.", sample: "Run now · 3 observations" },
      { icon: Eye, title: "See who is named", text: "Each answer shows whether you or a tracked competitor was mentioned or cited.", sample: "You · Daily Grind" },
      { icon: PieChart, title: "Track share of voice", text: "See how often it is you across the last 30 days of answers.", sample: "38% share of voice" },
    ],
  },
  rows: [
    {
      eyebrow: "The new word of mouth",
      title: "Your customers are asking AI for recommendations",
      text: "More people ask an assistant where to eat, who to call or which clinic to book. You cannot see those answers from your Google dashboard. Prompt tracking shows you what they say.",
      points: [
        "Prompts for discovery, comparison, booking and your own name",
        "Add a city to keep answers local",
        "Open any answer to read exactly what the engine said",
      ],
      media: {
        kind: "photo",
        src: "/marketing/home/hero-local-owner.webp",
        alt: "A smiling café owner checking his phone beside a pastry counter",
        objectPosition: "center 30%",
        overlay: (
          <>
            <OverlayCard icon={Bot} title="Prompt run finished" text="“best coffee shop in Kansas City” · 3 engines" tone="dark" />
            <OverlayCard icon={Quote} title="Corner Café was mentioned" text="Named in 2 of 3 answers, cited once" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "Share of voice",
      title: "See if AI picks you or the place down the street",
      text: "When an answer names you or a competitor you track, it counts toward share of voice. Visibility is shown per engine, so you know where you are strong and where you are missing.",
      points: [
        "Share of voice against your tracked competitors, last 30 days",
        "Visibility per engine, with how each number was measured",
        "Head-to-head and trend view for every prompt",
      ],
      media: { kind: "visual", node: <AiVisibilityShareVisual />, label: "Share of voice bars and AI visibility per engine" },
    },
    {
      eyebrow: "Clear costs",
      title: "Pay only for answers you actually get",
      text: "Each successful answer from one engine is one test, paid from your AEO balance. Your plan adds credit each billing cycle, and you can add more when you need it.",
      points: [
        "$2.50 per test; failed answers are not charged",
        "Starter includes $5 of credit per billing cycle, Professional $10",
        "Add balance in $10, $25 or $50 packs; tests pause when it runs out",
      ],
      media: { kind: "visual", node: <AiVisibilityLibraryVisual />, label: "Prompt library with active prompts, AEO balance and a Run now button" },
    },
  ],
  facts: [
    { value: "$2.50", label: "Per test: one successful answer from one engine" },
    { value: "$5 / $10", label: "AEO credit per billing cycle on Starter / Professional" },
    { value: "4", label: "Prompt types: discovery, comparison, transactional, branded" },
    { value: "1, 3 or 5", label: "Observations per prompt on a manual run" },
  ],
  capabilities: {
    title: "Tools to understand and improve how AI sees you",
    items: [
      { icon: MessageSquarePlus, title: "Prompt library", text: "Add, pause and export prompts, or start from suggestions." },
      { icon: PieChart, title: "Share of voice", text: "How often AI names you versus the competitors you track." },
      { icon: Swords, title: "Competitive insights", text: "Sources AI cites for competitors but not for you, and citation history." },
      { icon: FileCode2, title: "llms.txt check", text: "See whether your site has a valid llms.txt file." },
      { icon: MapPinned, title: "NAP directories", text: "Check your name, address and phone across connected directory profiles." },
      { icon: Wallet, title: "Simple billing", text: "Plan credit each cycle, top-ups when needed, no charge for failed answers." },
    ],
  },
  note: "Engine coverage depends on provider availability and can change; the Prompts tab shows which engines are live for you. Manual runs use every available engine; scheduled runs currently use Gemini. Credit does not roll over. AI answers vary from one run to the next, so read trends over time rather than a single answer.",
  faqs: [
    { question: "What is AEO?", answer: "AEO, or answer engine optimization, is about showing up in the answers AI assistants give. Zyene tracks the prompts you choose and records whether each answer mentions or cites your business or a competitor." },
    { question: "Which AI engines does Zyene check?", answer: "Engines such as ChatGPT, Perplexity and Gemini, plus Google AI Overviews where available. Coverage depends on provider availability, and the Prompts tab shows which engines are live for your account." },
    { question: "How much does AI visibility tracking cost?", answer: "Each successful answer from one engine is one test at $2.50, paid from your AEO balance. Starter includes $5 of credit per billing cycle and Professional $10, without rollover. You can add $10, $25 or $50 at a time." },
    { question: "Am I charged when an engine fails to answer?", answer: "No. Only answers that come back successfully count as tests. Failed or refused answers are not charged and are not counted against your visibility." },
    { question: "Can Zyene make ChatGPT recommend my business?", answer: "No tool can guarantee that. Zyene shows where you are missing, which sources engines cite for competitors, and gives you tools like the llms.txt and directory checks to act on." },
  ],
  related: ["local-seo", "competitor-tracking", "smart-insights"],
};
