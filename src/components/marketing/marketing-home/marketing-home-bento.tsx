import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InViewPlay } from "@/components/marketing/in-view-play";
import {
  BentoInsightsVisual,
  BentoReplyVisual,
  BentoRequestVisual,
  BentoStandVisual,
  BentoVisibilityVisual,
} from "@/components/marketing/marketing-home/home-bento-visuals";

type Cell = { key: string; title: string; text: string; href: string; link: string; visual: ReactNode };

const CELLS: Cell[] = [
  {
    key: "replies",
    title: "Every Google review answered, even on your busiest day.",
    text: "Pick the star ratings and a tone. New reviews get a thoughtful reply without you lifting a finger. Turn it off anytime.",
    href: "/features/automatic-review-replies",
    link: "Automatic replies",
    visual: <BentoReplyVisual />,
  },
  {
    key: "requests",
    title: "Requests that sound like you.",
    text: "Text or email, sent now or after the visit, with a gentle reminder.",
    href: "/features/review-requests",
    link: "Review requests",
    visual: <BentoRequestVisual />,
  },
  {
    key: "stands",
    title: "Tap, scan, review.",
    text: "Print a QR poster or order NFC stands in the app for $4.99 each.",
    href: "/features/nfc-review-stands",
    link: "NFC review stands",
    visual: <BentoStandVisual />,
  },
  {
    key: "insights",
    title: "Hear what they keep saying.",
    text: "Smart Insights groups reviews into themes so you know what to fix first.",
    href: "/features/smart-insights",
    link: "Smart Insights",
    visual: <BentoInsightsVisual />,
  },
  {
    key: "visibility",
    title: "Show up in AI answers.",
    text: "See whether ChatGPT, Perplexity and Gemini recommend you or a competitor.",
    href: "/features/ai-visibility",
    link: "AI visibility",
    visual: <BentoVisibilityVisual />,
  },
];

export function MarketingHomeBento() {
  return (
    <section className="marketing-section home-bento-section" aria-labelledby="home-bento-heading">
      <div className="marketing-container">
        <div className="home-section-head">
          <p className="marketing-eyebrow">The platform</p>
          <h2 id="home-bento-heading">Everything your reputation needs. Nothing it doesn&apos;t.</h2>
        </div>
        <InViewPlay className="home-bento" threshold={0.15}>
          {CELLS.map(({ key, title, text, href, link, visual }) => (
            <article key={key} className={`bento-cell bento-cell--${key}`}>
              <div className="bento-copy">
                <h3>{title}</h3>
                <p>{text}</p>
                <Link href={href} className="home-text-link">
                  {link} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
              <div className="bento-visual">{visual}</div>
            </article>
          ))}
        </InViewPlay>
        <Link href="/features" className="marketing-button marketing-button-secondary home-bento-all">
          Explore all features <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
