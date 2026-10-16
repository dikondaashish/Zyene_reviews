import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHero } from "@/components/marketing/landing-hero";
import { FeatureDemoFrame } from "@/components/marketing/interior/feature-demo-frame";
import { ProductTour } from "@/components/marketing/product-tour/product-tour";
import { TrialTerms } from "@/components/marketing/trial-terms";
import { FeatureLandingFlow } from "@/components/marketing/feature-landing/feature-landing-flow";
import { FeatureLandingRows } from "@/components/marketing/feature-landing/feature-landing-rows";
import {
  FeatureLandingCapabilities,
  FeatureLandingFacts,
  FeatureLandingFaq,
  FeatureLandingRelated,
} from "@/components/marketing/feature-landing/feature-landing-details";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { BreadcrumbJsonLd, HowToJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
import type { FeaturePillarPage } from "@/lib/growth/feature-pillars";

const BASE = "https://www.zyenereviews.com";

export function FeatureLandingView({ pillar, content }: { pillar: FeaturePillarPage; content: FeatureLandingContent }) {
  const { hero, flow } = content;
  return (
    <div className="fl-page">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE}/` },
          { name: "Features", url: `${BASE}/features` },
          { name: pillar.title, url: `${BASE}/features/${pillar.slug}` },
        ]}
      />
      <HowToJsonLd
        name={flow.title}
        description={flow.intro}
        steps={flow.steps.map((step) => ({ name: step.title, text: step.text }))}
      />
      <LandingHero
        eyebrow={hero.eyebrow}
        title={hero.headline}
        description={hero.lede}
        media={{ kind: "product", label: hero.visualLabel, node: <div className="fl-hero-visual">{hero.visual}</div> }}
        primary={{ label: "Start free trial", href: "/signup" }}
        secondary={{ label: "Book a walkthrough", href: "/demo" }}
      >
        <Link href="/features" className="underline underline-offset-4">
          See every feature
        </Link>
      </LandingHero>
      <FeatureLandingFlow flow={flow} />
      {content.demoTab && (
        <section className="marketing-section fl-demo" aria-labelledby="fl-demo-heading">
          <div className="marketing-container">
            <div className="fl-section-head">
              <p className="marketing-eyebrow">Try it</p>
              <h2 id="fl-demo-heading">Click around a sample workspace</h2>
            </div>
            <FeatureDemoFrame label={`${pillar.navLabel} product demonstration`} caption="Fictional business data. Safe to explore.">
              <ProductTour initialTab={content.demoTab} />
            </FeatureDemoFrame>
          </div>
        </section>
      )}
      <FeatureLandingRows rows={content.rows} />
      {content.facts && <FeatureLandingFacts facts={content.facts} />}
      <FeatureLandingCapabilities capabilities={content.capabilities} />
      <FeatureLandingFaq faqs={content.faqs} note={content.note} />
      <FeatureLandingRelated related={content.related} />
      <section className="marketing-section">
        <div className="marketing-container feature-detail-cta">
          <div>
            <p className="marketing-eyebrow">From $29.99 per month</p>
            <h2>{pillar.tagline}</h2>
            <TrialTerms />
          </div>
          <div className="marketing-actions">
            <Link href={SIGNUP_URL} className="marketing-button" data-track="trial" data-track-location="feature-cta">
              Start free trial <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="marketing-button marketing-button-secondary">
              Explore pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
