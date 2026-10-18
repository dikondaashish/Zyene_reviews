import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { TRIAL_HERO_LINE } from "@/lib/marketing/trial-copy";

type FeatureLandingHeroProps = {
  /** SEO phrase set as a quiet kicker inside the H1, like the homepage. */
  kicker: string;
  headline: string;
  lede: string;
  /** Breadcrumb trail above the H1; the last entry is the current page. */
  crumbs?: { name: string; href: string }[];
  visual?: ReactNode;
  visualLabel?: string;
};

/** Hero for /features and every /features/[slug]: short headline, two actions, one line of trial terms. */
export function FeatureLandingHero({ kicker, headline, lede, crumbs, visual, visualLabel }: FeatureLandingHeroProps) {
  return (
    <section className={`fl-hero${visual ? " fl-hero--split" : ""}`} aria-labelledby="fl-hero-title">
      <div className="marketing-container fl-hero-grid">
        <div className="fl-hero-copy">
          {crumbs && (
            <nav aria-label="Breadcrumb" className="fl-crumbs">
              <ol>
                {crumbs.map((crumb, index) => (
                  <li key={crumb.href}>
                    {index < crumbs.length - 1 ? <Link href={crumb.href}>{crumb.name}</Link> : <span aria-current="page">{crumb.name}</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 id="fl-hero-title" className="fl-hero-title">
            <span className="fl-hero-kicker">{kicker}</span> <span className="fl-hero-headline">{headline}</span>
          </h1>
          <p className="fl-hero-lede">{lede}</p>
          <div className="fl-hero-actions">
            <Link href={SIGNUP_URL} className="marketing-button" data-track="trial" data-track-location="hero">
              Start 7-day free trial <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/demo" className="marketing-button marketing-button-secondary" data-track="demo" data-track-location="hero">
              Book a demo
            </Link>
          </div>
          <p className="fl-hero-terms">{TRIAL_HERO_LINE}</p>
        </div>
        {visual && (
          <figure className="fl-hero-visual" aria-label={visualLabel}>
            {visual}
          </figure>
        )}
      </div>
    </section>
  );
}
