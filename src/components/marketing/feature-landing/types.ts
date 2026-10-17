import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";
import type { ProductTourTab } from "@/components/marketing/product-tour/product-tour";

/** One node in the "How it works" flow diagram. */
export type FlowStep = {
  icon: LucideIcon;
  title: string;
  text: string;
  /** Small sample shown inside the node, e.g. a tag, a message line or a value. */
  sample?: string;
};

/** Optional split after the linear steps, e.g. high rating → Google, low rating → private. */
export type FlowBranch = {
  label: string;
  paths: { icon: LucideIcon; title: string; text: string; tone: "positive" | "caution" }[];
};

export type StoryMedia =
  | { kind: "photo"; src: string; alt: string; objectPosition?: string; overlay?: ReactNode }
  | { kind: "visual"; node: ReactNode; label: string };

export type StoryRow = {
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  media: StoryMedia;
};

export type Capability = { icon: LucideIcon; title: string; text: string };

export type Fact = { value: string; label: string };

export type FeatureLandingContent = {
  slug: FeaturePillarSlug;
  hero: {
    /** SEO phrase shown as a quiet kicker inside the H1. */
    kicker: string;
    /** Eight words or fewer where possible. */
    headline: string;
    /** 25 words or fewer. */
    lede: string;
    /** Product mock shown beside the headline. */
    visual: ReactNode;
    visualLabel: string;
  };
  flow: {
    title: string;
    intro: string;
    steps: FlowStep[];
    branch?: FlowBranch;
  };
  rows: StoryRow[];
  capabilities: { title: string; items: Capability[] };
  facts?: Fact[];
  /** Interactive product tour tab, when one exists for this feature. */
  demoTab?: ProductTourTab;
  /** Honest limits; rendered small above the FAQ. */
  note?: string;
  faqs: { question: string; answer: string }[];
  related: FeaturePillarSlug[];
};
